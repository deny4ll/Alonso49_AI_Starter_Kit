import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { COACH_SYSTEM_PROMPT, ALONSO49_METHODOLOGY } from './coach-prompt';
import { COACH_TOOLS } from './tools/tool-definitions';
import { CoachTools } from './tools/tool-implementations';
import { VideosService } from '../videos/videos.service';
import { SessionsService } from '../sessions/sessions.service';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CoachContext {
  userId: string;
  sessionId?: string;
  videoId?: string;
  athleteData?: any;
  weatherData?: any;
  performanceData?: any;
}

@Injectable()
export class AiCoachService {
  private openaiApiKey: string;
  private openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
  private tools: CoachTools;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private videosService: VideosService,
    private sessionsService: SessionsService,
  ) {
    this.openaiApiKey = this.config.get('OPENAI_API_KEY');
    this.tools = new CoachTools(prisma);
  }

  async chat(userId: string, message: string, context?: CoachContext) {
    const systemContext = await this.buildSystemContext(userId, context);

    const messages: Message[] = [
      {
        role: 'system',
        content: COACH_SYSTEM_PROMPT,
      },
      {
        role: 'system',
        content: `# CONTEXT\n\n${systemContext}`,
      },
      {
        role: 'system',
        content: ALONSO49_METHODOLOGY,
      },
      {
        role: 'user',
        content: message,
      },
    ];

    // Call OpenAI with tools enabled
    const { response, toolCalls } = await this.callOpenAI(messages, userId);

    await this.saveConversation(userId, message, response, context);
    await this.trackUsage(userId);

    return {
      message: response,
      context: systemContext,
      toolsUsed: toolCalls?.length || 0,
    };
  }

  /**
   * Buscador ("lupa") del AI Coach: filtra videos/informes y sesiones por
   * viento, fecha, área/maniobra (tagKey), sitio o texto libre.
   */
  async search(
    userId: string,
    query: {
      q?: string;
      windMin?: number;
      windMax?: number;
      dateFrom?: string;
      dateTo?: string;
      location?: string;
      tagKey?: string;
    },
  ) {
    const filters = { ...query, mine: true, userId };
    const [videos, sessions] = await Promise.all([
      this.videosService.findAll(filters),
      this.sessionsService.search(filters),
    ]);

    return { videos, sessions };
  }

  /**
   * Agrupa los turnos de chat en "sesiones de uso" (para Estadísticas: horas
   * dedicadas al AI Coach). Una nueva sesión arranca si pasaron > 30 min.
   */
  private async trackUsage(userId: string) {
    const INACTIVITY_CUTOFF_MS = 30 * 60 * 1000;
    const recent = await this.prisma.aiCoachSession.findFirst({
      where: { userId },
      orderBy: { lastActivityAt: 'desc' },
    });

    const now = new Date();
    if (recent && now.getTime() - recent.lastActivityAt.getTime() < INACTIVITY_CUTOFF_MS) {
      await this.prisma.aiCoachSession.update({
        where: { id: recent.id },
        data: { lastActivityAt: now, messageCount: { increment: 1 } },
      });
    } else {
      await this.prisma.aiCoachSession.create({ data: { userId, messageCount: 1 } });
    }
  }

  async analyzeVideo(userId: string, videoId: string, specificQuestion?: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        session: {
          include: {
            analytics: true,
          },
        },
      },
    });

    if (!video) {
      throw new Error('Video no encontrado');
    }

    const analysisPrompt = specificQuestion || 
      'Analiza este video de entrenamiento y proporciona feedback técnico detallado según la metodología Alonso49.';

    const videoContext = `
# VIDEO ANALYSIS REQUEST

Video ID: ${video.id}
Title: ${video.title}
Description: ${video.description || 'No description'}

${video.session ? `
Session Details:
- Title: ${video.session.title}
- Location: ${video.session.location || 'Unknown'}
- Wind Speed: ${video.session.windSpeed || 'Not recorded'} knots
- Wind Direction: ${video.session.windDirection || 'Not recorded'}
- Wave Height: ${video.session.waveHeight || 'Not recorded'} m
- Status: ${video.session.status}

${video.session.analytics ? `
Performance Metrics:
- Total Distance: ${video.session.analytics.totalDistance || 'N/A'} nm
- Average Speed: ${video.session.analytics.averageSpeed || 'N/A'} knots
- Max Speed: ${video.session.analytics.maxSpeed || 'N/A'} knots
- Tacking Efficiency: ${video.session.analytics.tackingEfficiency || 'N/A'}%
- Gybe Count: ${video.session.analytics.gybeCount || 'N/A'}
- Tack Count: ${video.session.analytics.tackCount || 'N/A'}
- Performance Score: ${video.session.analytics.performanceScore || 'N/A'}
` : ''}
` : ''}

IMPORTANT: Since you cannot actually watch the video, focus your analysis on:
1. The session data and metrics provided
2. General coaching recommendations based on the conditions
3. What to look for when the athlete reviews the video
4. Specific drills to improve the metrics shown
5. Questions to ask the athlete about what happened
`;

    return this.chat(userId, analysisPrompt, {
      userId,
      videoId,
      sessionId: video.sessionId,
    });
  }

  async analyzeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        videos: true,
        feedback: true,
        analytics: true,
      },
    });

    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    const sessionContext = `
# SESSION ANALYSIS REQUEST

Session: ${session.title}
Date: ${session.scheduledAt || session.createdAt}
Location: ${session.location || 'Not specified'}
Status: ${session.status}

## Weather Conditions
- Wind Speed: ${session.windSpeed || 'Not recorded'} knots
- Wind Direction: ${session.windDirection || 'Not recorded'}
- Wave Height: ${session.waveHeight || 'Not recorded'} m

${session.description ? `
## Session Description
${session.description}
` : ''}

${session.analytics ? `
## Performance Analytics
- Total Distance: ${session.analytics.totalDistance || 'N/A'} nm
- Average Speed: ${session.analytics.averageSpeed || 'N/A'} knots
- Max Speed: ${session.analytics.maxSpeed || 'N/A'} knots
- Tacking Efficiency: ${session.analytics.tackingEfficiency || 'N/A'}%
- Gybe Count: ${session.analytics.gybeCount || 0}
- Tack Count: ${session.analytics.tackCount || 0}
- Performance Score: ${session.analytics.performanceScore || 'N/A'}/100
` : ''}

${session.videos.length > 0 ? `
## Videos Available
${session.videos.map(v => `- ${v.title}`).join('\n')}
` : ''}

${session.feedback.length > 0 ? `
## Previous Feedback
${session.feedback.map(f => f.content).join('\n\n')}
` : ''}

Analyze this training session and provide comprehensive coaching feedback.
`;

    return this.chat(userId, sessionContext, {
      userId,
      sessionId,
    });
  }

  async getTrainingPlan(userId: string, goals?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        athleteProfile: true,
        sessions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            analytics: true,
          },
        },
      },
    });

    const recentPerformance = user.sessions
      .filter(s => s.analytics)
      .map(s => ({
        date: s.createdAt,
        score: s.analytics.performanceScore,
        distance: s.analytics.totalDistance,
        avgSpeed: s.analytics.averageSpeed,
      }));

    const planPrompt = `
# TRAINING PLAN REQUEST

Athlete: ${user.firstName} ${user.lastName}
Role: ${user.role}

${goals ? `
## Stated Goals
${goals}
` : ''}

## Recent Performance (Last 10 Sessions)
${recentPerformance.length > 0 ? 
  recentPerformance.map(p => 
    `- ${new Date(p.date).toLocaleDateString()}: Score ${p.score || 'N/A'}, Avg Speed ${p.avgSpeed || 'N/A'} knots`
  ).join('\n') : 
  'No recent sessions recorded'
}

Create a personalized 4-week training plan following the Alonso49 Methodology.
Include specific exercises, drills, and measurable objectives.
`;

    return this.chat(userId, planPrompt, { userId });
  }

  private async buildSystemContext(userId: string, context?: CoachContext): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        athleteProfile: true,
        coachProfile: true,
        sessions: {
          take: 1,
          orderBy: { createdAt: 'desc' as const },
          include: {
            analytics: true,
            feedback: {
              take: 1,
              orderBy: { createdAt: 'desc' as const },
              include: {
                coach: true,
              },
            },
          },
        },
        uploadedVideos: {
          take: 3,
          orderBy: { createdAt: 'desc' as const },
        },
      },
    });

    if (!user) {
      return 'User not found';
    }

    const userData = user as any;
    const lastSession = userData.sessions?.[0];
    const lastFeedback = lastSession?.feedback?.[0];
    const recentVideos = userData.uploadedVideos || [];
    const profile = userData.athleteProfile;

    let systemContext = `You are coaching the following athlete.

**Athlete**
${user.firstName} ${user.lastName}

**Age**
${profile?.birthDate ? this.calculateAge(profile.birthDate) : 'Not specified'}

**Country**
${profile?.nationality || 'Not specified'}

**Crew Position**
${profile?.position || 'Not specified'}

**Experience**
${profile?.experienceLevel || 'Not specified'}

**Boat**
49er (Olympic Class)

**Coach**
${profile?.assignedCoach || 'Not assigned'}

**Current Season Goal**
${profile?.seasonGoal || 'Not defined'}

**Current Microcycle**
${profile?.currentMicrocycle || 'Not defined'}

**Current Week Objectives**
${profile?.weeklyObjectives || 'Not defined'}

**Current KPIs**
${profile?.kpis ? JSON.stringify(profile.kpis) : 'Not defined'}

**Last Training**
${lastSession ? `
- Session: ${lastSession.title}
- Date: ${lastSession.scheduledAt ? new Date(lastSession.scheduledAt).toLocaleDateString() : new Date(lastSession.createdAt).toLocaleDateString()}
- Location: ${lastSession.location || 'Not specified'}
- Wind: ${lastSession.windSpeed || 'N/A'} knots ${lastSession.windDirection || ''}
- Waves: ${lastSession.waveHeight || 'N/A'} m
- Status: ${lastSession.status}
${lastSession.analytics ? `
- Performance Score: ${lastSession.analytics.performanceScore || 'N/A'}/100
- Average Speed: ${lastSession.analytics.averageSpeed || 'N/A'} knots
- Max Speed: ${lastSession.analytics.maxSpeed || 'N/A'} knots
- Total Distance: ${lastSession.analytics.totalDistance || 'N/A'} nm
- Tacks: ${lastSession.analytics.tackCount || 0}
- Gybes: ${lastSession.analytics.gybeCount || 0}
- Tacking Efficiency: ${lastSession.analytics.tackingEfficiency || 'N/A'}%
` : ''}` : 'No recent training sessions'}

**Latest Coach Feedback**
${lastFeedback ? `
From: ${lastFeedback.coach.firstName} ${lastFeedback.coach.lastName}
Date: ${new Date(lastFeedback.createdAt).toLocaleDateString()}
Content: ${lastFeedback.content}
` : 'No recent feedback'}

**Recent Videos**
${recentVideos.length > 0 ? recentVideos.map(v => `
- ${v.title} (${new Date(v.createdAt).toLocaleDateString()})
  ${v.description || 'No description'}
`).join('\n') : 'No recent videos uploaded'}

**Current Weather**
${context?.weatherData ? JSON.stringify(context.weatherData, null, 2) : 'Weather data not available'}

**Upcoming Regatta**
${profile?.nextEvent || 'No upcoming events scheduled'}

**Current Boat Setup**
${profile?.boatSetup || 'Standard setup - not customized'}

**Today's Focus**
${profile?.todayObjective || 'Not defined'}

---

**IMPORTANT INSTRUCTIONS:**
- Use this information during the conversation
- Never ask again for information already available above
- If you need more details, ask specific questions
- Always reference the data provided when making recommendations
- Respect the Current Week Objectives and Today's Focus in your coaching
`;

    if (context?.athleteData) {
      systemContext += `\n\n**Additional Context**\n${JSON.stringify(context.athleteData, null, 2)}`;
    }

    return systemContext;
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  private async callOpenAI(messages: Message[], userId: string): Promise<{ response: string; toolCalls: any[] }> {
    if (!this.openaiApiKey) {
      return {
        response: this.getMockResponse(messages),
        toolCalls: [],
      };
    }

    try {
      const allToolCalls = [];
      let currentMessages = [...messages];
      let iterations = 0;
      const MAX_ITERATIONS = 5; // Prevent infinite loops

      while (iterations < MAX_ITERATIONS) {
        const response = await fetch(this.openaiApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: currentMessages,
            tools: COACH_TOOLS,
            tool_choice: 'auto',
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const assistantMessage = data.choices[0].message;

        // Add assistant response to conversation
        currentMessages.push(assistantMessage);

        // Check if AI wants to call tools
        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
          // Execute all tool calls
          for (const toolCall of assistantMessage.tool_calls) {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);

            console.log(`[AI Coach] Calling tool: ${functionName}`, functionArgs);

            let toolResult;
            try {
              // Execute the tool
              toolResult = await this.executeTool(functionName, functionArgs, userId);
              allToolCalls.push({ name: functionName, args: functionArgs, result: toolResult });
            } catch (error) {
              toolResult = {
                success: false,
                message: `Error executing ${functionName}: ${error.message}`,
              };
            }

            // Add tool result to conversation
            currentMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult),
            } as any);
          }

          iterations++;
          continue; // Loop again to let AI process tool results
        }

        // No more tool calls, return final response
        return {
          response: assistantMessage.content,
          toolCalls: allToolCalls,
        };
      }

      // Max iterations reached
      return {
        response: currentMessages[currentMessages.length - 1].content || 'Unable to generate response',
        toolCalls: allToolCalls,
      };

    } catch (error) {
      console.error('Error calling OpenAI:', error);
      return {
        response: this.getMockResponse(messages),
        toolCalls: [],
      };
    }
  }

  private async executeTool(functionName: string, args: any, userId: string): Promise<any> {
    // Map function names to CoachTools methods
    const toolMap = {
      searchLessons: (a, u) => this.tools.searchLessons(a, u),
      searchExercises: (a, u) => this.tools.searchExercises(a, u),
      searchVideos: (a, u) => this.tools.searchVideos(a, u),
      searchCoachNotes: (a, u) => this.tools.searchCoachNotes(a, u),
      searchBoatSetup: (a, u) => this.tools.searchBoatSetup(a, u),
      searchWeather: (a, u) => this.tools.searchWeather(a, u),
      searchTrainingReports: (a, u) => this.tools.searchTrainingReports(a, u),
      searchPerformanceReports: (a, u) => this.tools.searchPerformanceReports(a, u),
      searchGPS: (a, u) => this.tools.searchGPS(a, u),
      searchVideoAnalysis: (a, u) => this.tools.searchVideoAnalysis(a, u),
      searchCompetitionHistory: (a, u) => this.tools.searchCompetitionHistory(a, u),
      searchKnowledgeBase: (a, u) => this.tools.searchKnowledgeBase(a, u),
      generateTrainingPlan: (a, u) => this.tools.generateTrainingPlan(a, u),
      generateBriefing: (a, u) => this.tools.generateBriefing(a, u),
      generateDebriefing: (a, u) => this.tools.generateDebriefing(a, u),
      createGoal: (a, u) => this.tools.createGoal(a, u),
      scheduleTraining: (a, u) => this.tools.scheduleTraining(a, u),
      comparePerformance: (a, u) => this.tools.comparePerformance(a, u),
      recommendBoatSetup: (a, u) => this.tools.recommendBoatSetup(a, u),
      recommendExercises: (a, u) => this.tools.recommendExercises(a, u),
      recommendVideos: (a, u) => this.tools.recommendVideos(a, u),
      recommendLessons: (a, u) => this.tools.recommendLessons(a, u),
    };

    const toolFunction = toolMap[functionName];
    if (!toolFunction) {
      throw new Error(`Unknown tool: ${functionName}`);
    }

    return toolFunction(args, userId);
  }

  private getMockResponse(messages: Message[]): string {
    const userMessage = messages.find(m => m.role === 'user')?.content || '';

    return `## Assessment

Based on your query, I need more specific information to provide accurate coaching.

## Why

Every coaching recommendation should be based on concrete data and observations. The Alonso49 Methodology emphasizes data-driven decisions.

## Recommendation

Please provide:
- Specific session details (wind conditions, course, duration)
- Performance metrics if available
- What specifically you want to improve

## Training

Once I have more information, I can recommend specific drills from our training library.

## Lessons

Check the Academy for foundational lessons on:
- Boat handling fundamentals
- Weather reading
- Tactical decision making

## Success Criteria

We will measure improvement through:
- Quantitative metrics (speed, angles, timing)
- Video analysis comparison
- Session-to-session progress tracking

**Note:** This is a demo response. Configure OPENAI_API_KEY environment variable for full AI capabilities.`;
  }

  private async saveConversation(
    userId: string,
    userMessage: string,
    aiResponse: string,
    context?: CoachContext,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'AI_COACH_CONVERSATION',
        entity: 'ai_coach',
        entityId: context?.sessionId || context?.videoId || null,
        changes: {
          userMessage,
          aiResponse,
          context: context ? JSON.parse(JSON.stringify(context)) : null,
        },
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { COACH_SYSTEM_PROMPT, ALONSO49_METHODOLOGY } from './coach-prompt';

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

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.openaiApiKey = this.config.get('OPENAI_API_KEY');
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

    const response = await this.callOpenAI(messages);
    
    await this.saveConversation(userId, message, response, context);

    return {
      message: response,
      context: systemContext,
    };
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

  private async callOpenAI(messages: Message[]): Promise<string> {
    if (!this.openaiApiKey) {
      return this.getMockResponse(messages);
    }

    try {
      const response = await fetch(this.openaiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      return this.getMockResponse(messages);
    }
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

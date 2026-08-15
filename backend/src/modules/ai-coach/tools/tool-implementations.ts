import { PrismaService } from '../../../prisma/prisma.service';

export class CoachTools {
  constructor(private prisma: PrismaService) {}

  // ===== SEARCH TOOLS =====

  async searchLessons(args: any, userId: string) {
    const { query, skillLevel, limit = 5 } = args;

    const courses = await this.prisma.course.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        modules: true,
        academy: true,
      },
      take: limit,
    });

    return {
      success: true,
      data: courses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        academy: course.academy?.name || 'SAILVEX',
        moduleCount: course.modules.length,
        price: course.price,
        modules: course.modules.map((m) => ({
          title: m.title,
          description: m.description,
        })),
      })),
      message: `Found ${courses.length} lessons matching "${query}"`,
    };
  }

  async searchExercises(args: any, userId: string) {
    const { query, focus, duration } = args;

    // En una implementación real, buscarías en una tabla de exercises
    // Por ahora, retornamos ejercicios de la metodología SAILVEX
    const exercises = [
      {
        name: 'Viradas en Escalera',
        description: '20 viradas en 10 minutos con focus en timing y sincronización',
        focus: 'boat_handling',
        duration: 'short',
        objectives: [
          'Reducir pérdida de velocidad a <0.8 nudos por virada',
          'Mejorar coordinación proa-popa',
          'Optimizar timing de trimado',
        ],
        successCriteria: {
          tackingEfficiency: '>85%',
          speedLoss: '<0.8 knots',
          executionTime: '<3 seconds',
        },
      },
      {
        name: 'Drill de Velocidad en Ceñida',
        description: 'Navegación en ceñida optimizando VMG durante 30 minutos',
        focus: 'speed',
        duration: 'medium',
        objectives: [
          'Maximizar VMG (Velocity Made Good)',
          'Encontrar ángulo óptimo',
          'Mantener velocidad consistente',
        ],
        successCriteria: {
          avgSpeed: '>6.8 knots',
          vmgEfficiency: '>92%',
          consistency: '<5% variance',
        },
      },
      {
        name: '練習 de Salidas',
        description: 'Simulación de línea de salida con marca virtual',
        focus: 'starts',
        duration: 'medium',
        objectives: [
          'Timing preciso en salida',
          'Control de posición pre-start',
          'Aceleración óptima',
        ],
        successCriteria: {
          timingAccuracy: '<2 seconds',
          startPosition: 'Top 3 on line',
          acceleration: 'Full speed in 10s',
        },
      },
    ];

    // Filtrar por query
    const filtered = exercises.filter((ex) =>
      ex.name.toLowerCase().includes(query.toLowerCase()) ||
      ex.description.toLowerCase().includes(query.toLowerCase()) ||
      (focus && ex.focus === focus)
    );

    return {
      success: true,
      data: filtered,
      message: `Found ${filtered.length} exercises matching "${query}"`,
    };
  }

  async searchVideos(args: any, userId: string) {
    const { query, sessionId, dateFrom, limit = 5 } = args;

    const where: any = {
      uploadedById: userId,
      deletedAt: null,
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (sessionId) {
      where.sessionId = sessionId;
    }

    if (dateFrom) {
      where.createdAt = { gte: new Date(dateFrom) };
    }

    const videos = await this.prisma.video.findMany({
      where,
      include: {
        session: true,
        uploadedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      success: true,
      data: videos.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        url: v.url,
        duration: v.duration,
        uploadedAt: v.createdAt,
        session: v.session ? {
          id: v.session.id,
          title: v.session.title,
          date: v.session.scheduledAt || v.session.createdAt,
        } : null,
      })),
      message: `Found ${videos.length} videos`,
    };
  }

  async searchCoachNotes(args: any, userId: string) {
    const { query, dateFrom, coachName } = args;

    const where: any = {
      session: {
        createdById: userId,
      },
    };

    if (dateFrom) {
      where.createdAt = { gte: new Date(dateFrom) };
    }

    if (query) {
      where.content = { contains: query, mode: 'insensitive' };
    }

    const feedback = await this.prisma.feedback.findMany({
      where,
      include: {
        coach: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        session: {
          select: {
            title: true,
            scheduledAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Filtrar por nombre del coach si se proporciona
    const filtered = coachName
      ? feedback.filter((f) =>
          `${f.coach.firstName} ${f.coach.lastName}`.toLowerCase().includes(coachName.toLowerCase())
        )
      : feedback;

    return {
      success: true,
      data: filtered.map((f) => ({
        id: f.id,
        content: f.content,
        rating: f.rating,
        coach: `${f.coach.firstName} ${f.coach.lastName}`,
        session: f.session.title,
        date: f.createdAt,
      })),
      message: `Found ${filtered.length} coach notes`,
    };
  }

  async searchBoatSetup(args: any, userId: string) {
    const { windSpeed, windCondition, waveHeight } = args;

    // En producción, esto vendría de una base de datos de configuraciones
    const setups = [
      {
        condition: 'Light wind (0-8 knots)',
        windRange: [0, 8],
        setup: {
          mastRake: '25.5 feet',
          shroudTension: '380 lbs',
          forestayTension: '400 lbs',
          mainsheetTraveler: 'Centered',
          cunningham: 'Loose',
          vang: 'Very loose',
          outhaul: 'Eased 2"',
          jibCars: 'Forward and wide',
        },
      },
      {
        condition: 'Medium wind (9-15 knots)',
        windRange: [9, 15],
        setup: {
          mastRake: '25.8 feet',
          shroudTension: '480 lbs',
          forestayTension: '520 lbs',
          mainsheetTraveler: '3 clicks windward',
          cunningham: 'Medium',
          vang: 'Tight upwind, loose downwind',
          outhaul: 'Standard',
          jibCars: 'Standard position',
        },
      },
      {
        condition: 'Heavy wind (16-25 knots)',
        windRange: [16, 25],
        setup: {
          mastRake: '26.2 feet',
          shroudTension: '550 lbs',
          forestayTension: '600 lbs',
          mainsheetTraveler: '5 clicks windward',
          cunningham: 'Very tight',
          vang: 'Very tight',
          outhaul: 'Maximum',
          jibCars: 'Aft and narrow',
        },
      },
    ];

    // Encontrar setup apropiado
    let matchedSetup = setups[1]; // Default: medium
    if (windSpeed) {
      matchedSetup = setups.find(
        (s) => windSpeed >= s.windRange[0] && windSpeed <= s.windRange[1]
      ) || matchedSetup;
    } else if (windCondition) {
      const conditionMap = {
        light: 0,
        medium: 1,
        heavy: 2,
      };
      matchedSetup = setups[conditionMap[windCondition] || 1];
    }

    return {
      success: true,
      data: matchedSetup,
      message: `Boat setup for ${matchedSetup.condition}`,
    };
  }

  async searchWeather(args: any, userId: string) {
    const { location, date } = args;

    // En producción, llamarías a una API de clima real (OpenWeather, etc.)
    // Por ahora, retornamos datos mock
    return {
      success: true,
      data: {
        location,
        date: date || new Date().toISOString().split('T')[0],
        forecast: {
          windSpeed: 12,
          windDirection: 'NE',
          windGusts: 18,
          temperature: 24,
          humidity: 65,
          waveHeight: 0.8,
          visibility: 10,
          cloudCover: 40,
          precipitation: 0,
        },
        trend: 'Wind increasing in afternoon, backing to East',
        recommendation: 'Good conditions for upwind training. Expect gusts.',
      },
      message: `Weather forecast for ${location}`,
    };
  }

  async searchTrainingReports(args: any, userId: string) {
    const { dateFrom, dateTo, status } = args;

    const where: any = {
      createdById: userId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.scheduledAt = {};
      if (dateFrom) where.scheduledAt.gte = new Date(dateFrom);
      if (dateTo) where.scheduledAt.lte = new Date(dateTo);
    }

    const sessions = await this.prisma.session.findMany({
      where,
      include: {
        analytics: true,
        feedback: {
          include: {
            coach: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
      take: 10,
    });

    return {
      success: true,
      data: sessions.map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        date: s.scheduledAt || s.createdAt,
        status: s.status,
        location: s.location,
        conditions: {
          wind: `${s.windSpeed || 'N/A'} knots ${s.windDirection || ''}`,
          waves: `${s.waveHeight || 'N/A'} m`,
        },
        analytics: s.analytics ? {
          score: s.analytics.performanceScore,
          distance: s.analytics.totalDistance,
          avgSpeed: s.analytics.averageSpeed,
          maxSpeed: s.analytics.maxSpeed,
        } : null,
        feedbackCount: s.feedback.length,
      })),
      message: `Found ${sessions.length} training reports`,
    };
  }

  async searchPerformanceReports(args: any, userId: string) {
    const { metric, dateFrom, dateTo } = args;

    const where: any = {
      session: {
        createdById: userId,
      },
    };

    if (dateFrom || dateTo) {
      where.session = {
        ...where.session,
        scheduledAt: {},
      };
      if (dateFrom) where.session.scheduledAt.gte = new Date(dateFrom);
      if (dateTo) where.session.scheduledAt.lte = new Date(dateTo);
    }

    const analytics = await this.prisma.sessionAnalytics.findMany({
      where,
      include: {
        session: {
          select: {
            title: true,
            scheduledAt: true,
            windSpeed: true,
          },
        },
      },
      orderBy: {
        session: {
          scheduledAt: 'desc',
        },
      },
      take: 20,
    });

    // Calcular estadísticas
    const stats = {
      avgPerformanceScore: 0,
      avgSpeed: 0,
      avgTackingEfficiency: 0,
      totalSessions: analytics.length,
      improvement: null,
    };

    if (analytics.length > 0) {
      stats.avgPerformanceScore = analytics.reduce((sum, a) => sum + (a.performanceScore || 0), 0) / analytics.length;
      stats.avgSpeed = analytics.reduce((sum, a) => sum + (a.averageSpeed || 0), 0) / analytics.length;
      stats.avgTackingEfficiency = analytics.reduce((sum, a) => sum + (a.tackingEfficiency || 0), 0) / analytics.length;

      // Calcular tendencia (últimas 5 vs primeras 5)
      if (analytics.length >= 10) {
        const recent = analytics.slice(0, 5);
        const older = analytics.slice(-5);
        const recentAvg = recent.reduce((sum, a) => sum + (a.performanceScore || 0), 0) / 5;
        const olderAvg = older.reduce((sum, a) => sum + (a.performanceScore || 0), 0) / 5;
        stats.improvement = ((recentAvg - olderAvg) / olderAvg * 100).toFixed(1);
      }
    }

    return {
      success: true,
      data: {
        statistics: stats,
        sessions: analytics.map((a: any) => ({
          sessionTitle: a.session.title,
          date: a.session.scheduledAt,
          performanceScore: a.performanceScore,
          avgSpeed: a.averageSpeed,
          maxSpeed: a.maxSpeed,
          tackingEfficiency: a.tackingEfficiency,
          distance: a.totalDistance,
        })),
      },
      message: `Performance analysis for ${analytics.length} sessions`,
    };
  }

  async searchGPS(args: any, userId: string) {
    const { sessionId, maneuverType } = args;

    if (!sessionId) {
      return {
        success: false,
        message: 'Session ID required for GPS data',
      };
    }

    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        createdById: userId,
      },
      include: {
        analytics: true,
      },
    });

    if (!session) {
      return {
        success: false,
        message: 'Session not found',
      };
    }

    // En producción, aquí cargarías datos GPS reales de un archivo o tabla
    return {
      success: true,
      data: {
        sessionId,
        trackData: {
          totalPoints: 1247,
          duration: '3h 15min',
          avgSpeed: session.analytics?.averageSpeed || 0,
          maxSpeed: session.analytics?.maxSpeed || 0,
        },
        maneuvers: {
          tacks: session.analytics?.tackCount || 0,
          gybes: session.analytics?.gybeCount || 0,
        },
        message: 'GPS data available. Use video analysis for detailed track review.',
      },
      message: 'GPS summary retrieved',
    };
  }

  async searchVideoAnalysis(args: any, userId: string) {
    const { videoId, analysisType = 'technique' } = args;

    const video = await this.prisma.video.findFirst({
      where: {
        id: videoId,
        uploadedById: userId,
      },
      include: {
        session: {
          include: {
            analytics: true,
          },
        },
      },
    });

    if (!video) {
      return {
        success: false,
        message: 'Video not found',
      };
    }

    // En producción, aquí se haría análisis de video con ML/AI
    return {
      success: true,
      data: {
        videoId,
        title: video.title,
        analysisType,
        keyTimestamps: [
          { time: '00:42:15', event: 'Tack #12 - Body position issue', severity: 'medium' },
          { time: '01:15:30', event: 'Good acceleration out of gybe', severity: 'positive' },
          { time: '02:03:45', event: 'Trim delay post-tack', severity: 'high' },
        ],
        techniqueSummary: {
          strengths: ['Good boat balance', 'Smooth gybes', 'Consistent speed'],
          weaknesses: ['Body position in tacks', 'Trim timing', 'Heel control in gusts'],
          recommendations: [
            'Review timestamp 00:42:15 for body position correction',
            'Practice trim timing drill',
            'Work on anticipating gusts',
          ],
        },
      },
      message: `Video analysis complete for "${video.title}"`,
    };
  }

  async searchCompetitionHistory(args: any, userId: string) {
    const { eventName, year, dateFrom } = args;

    // En producción, esto vendría de una tabla de competiciones
    return {
      success: true,
      data: [
        {
          event: 'World Championship 49er',
          year: 2023,
          location: 'The Hague, Netherlands',
          date: '2023-07-15',
          result: {
            position: 12,
            totalCompetitors: 85,
            races: 12,
            bestRace: 3,
            worstRace: 24,
            consistency: 'Medium',
          },
        },
      ],
      message: 'Competition history retrieved',
    };
  }

  async searchKnowledgeBase(args: any, userId: string) {
    const { query, category, limit = 3 } = args;

    // En producción, usarías pgvector para búsqueda semántica
    const articles = [
      {
        title: 'Optimizing Tacking Efficiency in 49er',
        category: 'technique',
        content: 'Key principles for reducing speed loss during tacks...',
        relevance: 0.95,
      },
      {
        title: 'Pre-Tack Communication Protocols',
        category: 'methodology',
        content: 'SAILVEX methodology for crew communication...',
        relevance: 0.87,
      },
    ];

    return {
      success: true,
      data: articles.slice(0, limit),
      message: `Found ${articles.length} knowledge base articles`,
    };
  }

  // ===== GENERATE TOOLS =====

  async generateTrainingPlan(args: any, userId: string) {
    const { duration, focus, targetEvent } = args;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { athleteProfile: true },
    });

    return {
      success: true,
      data: {
        title: `${duration}-Week Training Plan - ${focus || 'General Performance'}`,
        athlete: `${user.firstName} ${user.lastName}`,
        targetEvent,
        duration: `${duration} weeks`,
        structure: {
          microcycles: duration / 4,
          sessionsPerWeek: 5,
          totalSessions: duration * 5,
        },
        weeklyBreakdown: `Weekly plan structure created. Focus: ${focus}`,
      },
      message: 'Training plan outline generated. Use this as template for detailed planning.',
    };
  }

  async generateBriefing(args: any, userId: string) {
    const { sessionType, objectives, conditions } = args;

    return {
      success: true,
      data: {
        sessionType,
        date: new Date().toISOString(),
        objectives: objectives || 'Focus on technique improvement',
        conditions: conditions || 'Variable conditions expected',
        safetyBriefing: 'Standard safety protocols apply',
        keyFocusPoints: [
          'Warm-up: 15 minutes easy sailing',
          'Main set: Execute planned drills',
          'Cool-down: Review and debrief',
        ],
      },
      message: 'Session briefing generated',
    };
  }

  async generateDebriefing(args: any, userId: string) {
    const { sessionId, whatWorked, whatDidntWork } = args;

    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        createdById: userId,
      },
      include: {
        analytics: true,
        feedback: true,
      },
    });

    if (!session) {
      return { success: false, message: 'Session not found' };
    }

    return {
      success: true,
      data: {
        sessionTitle: session.title,
        date: session.scheduledAt || session.createdAt,
        performanceScore: session.analytics?.performanceScore || 'N/A',
        whatWorked: whatWorked || 'To be filled by athlete',
        whatDidntWork: whatDidntWork || 'To be filled by athlete',
        keyLearnings: 'Review session data and coach feedback',
        actionItems: [
          'Review video footage',
          'Practice identified weaknesses',
          'Prepare for next session',
        ],
      },
      message: 'Debriefing template generated',
    };
  }

  // ===== ACTION TOOLS =====

  async createGoal(args: any, userId: string) {
    const { title, description, targetDate, successCriteria } = args;

    // En producción, crearías un registro en una tabla de goals
    // Por ahora, guardamos en audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'GOAL_CREATED',
        entity: 'goal',
        changes: {
          title,
          description,
          targetDate,
          successCriteria,
        },
      },
    });

    return {
      success: true,
      data: {
        title,
        description,
        targetDate,
        successCriteria,
        status: 'active',
        createdAt: new Date(),
      },
      message: `Goal "${title}" created successfully`,
    };
  }

  async scheduleTraining(args: any, userId: string) {
    const { title, scheduledAt, location, objectives } = args;

    const session = await this.prisma.session.create({
      data: {
        title,
        description: objectives,
        scheduledAt: new Date(scheduledAt),
        location,
        status: 'SCHEDULED',
        createdById: userId,
      },
    });

    return {
      success: true,
      data: {
        id: session.id,
        title: session.title,
        scheduledAt: session.scheduledAt,
        location: session.location,
        status: session.status,
      },
      message: `Training session "${title}" scheduled successfully`,
    };
  }

  async comparePerformance(args: any, userId: string) {
    const { session1Id, session2Id, metrics } = args;

    const [session1, session2] = await Promise.all([
      this.prisma.sessionAnalytics.findFirst({
        where: {
          sessionId: session1Id,
          session: { createdById: userId },
        },
        include: { session: true },
      }),
      this.prisma.sessionAnalytics.findFirst({
        where: {
          sessionId: session2Id,
          session: { createdById: userId },
        },
        include: { session: true },
      }),
    ]);

    if (!session1 || !session2) {
      return {
        success: false,
        message: 'One or both sessions not found',
      };
    }

    const comparison = {
      session1: {
        title: session1.session.title,
        date: session1.session.scheduledAt,
        score: session1.performanceScore,
        avgSpeed: session1.averageSpeed,
        tackingEfficiency: session1.tackingEfficiency,
      },
      session2: {
        title: session2.session.title,
        date: session2.session.scheduledAt,
        score: session2.performanceScore,
        avgSpeed: session2.averageSpeed,
        tackingEfficiency: session2.tackingEfficiency,
      },
      improvements: {
        score: ((session2.performanceScore - session1.performanceScore) / session1.performanceScore * 100).toFixed(1),
        avgSpeed: ((session2.averageSpeed - session1.averageSpeed) / session1.averageSpeed * 100).toFixed(1),
        tackingEfficiency: ((session2.tackingEfficiency - session1.tackingEfficiency) / session1.tackingEfficiency * 100).toFixed(1),
      },
    };

    return {
      success: true,
      data: comparison,
      message: 'Performance comparison complete',
    };
  }

  async recommendBoatSetup(args: any, userId: string) {
    // Reutilizar searchBoatSetup
    return this.searchBoatSetup(args, userId);
  }

  async recommendExercises(args: any, userId: string) {
    const { weakness, availableTime, conditions } = args;

    const exercises = await this.searchExercises({ query: weakness }, userId);

    return {
      success: true,
      data: {
        weakness,
        availableTime: `${availableTime} minutes`,
        recommendedExercises: exercises.data,
        prioritization: 'Start with highest impact drill',
      },
      message: `Recommended ${exercises.data.length} exercises for "${weakness}"`,
    };
  }

  async recommendVideos(args: any, userId: string) {
    const { topic, skillLevel } = args;

    const videos = await this.searchVideos({ query: topic, limit: 3 }, userId);

    return {
      success: true,
      data: {
        topic,
        skillLevel,
        recommendedVideos: videos.data,
        watchingOrder: 'Sequential - start with first video',
      },
      message: `Recommended ${videos.data.length} videos for "${topic}"`,
    };
  }

  async recommendLessons(args: any, userId: string) {
    const { weakness, goal, priority = 'medium' } = args;

    const query = weakness || goal || 'fundamentals';
    const lessons = await this.searchLessons({ query, limit: 3 }, userId);

    return {
      success: true,
      data: {
        weakness,
        goal,
        priority,
        recommendedLessons: lessons.data,
        learningPath: 'Complete lessons in order for best results',
      },
      message: `Recommended ${lessons.data.length} lessons`,
    };
  }
}

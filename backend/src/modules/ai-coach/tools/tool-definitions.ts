export const COACH_TOOLS = [
  // ===== SEARCH TOOLS =====
  {
    type: 'function',
    function: {
      name: 'searchLessons',
      description: 'Search for lessons in the Academy that match specific topics, skills, or learning objectives. Returns lessons from the course catalog.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for lesson topics (e.g., "tacking", "starts", "downwind speed")',
          },
          skillLevel: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced', 'elite'],
            description: 'Filter lessons by skill level',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of lessons to return (default: 5)',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchExercises',
      description: 'Search for training exercises and drills from the SAILVEX methodology library. Returns specific exercises with objectives and success criteria.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for exercise type (e.g., "tacking drill", "boat speed", "mark roundings")',
          },
          focus: {
            type: 'string',
            description: 'Primary focus area (e.g., "boat handling", "speed", "tactics", "starts")',
          },
          duration: {
            type: 'string',
            enum: ['short', 'medium', 'long'],
            description: 'Desired exercise duration',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchVideos',
      description: 'Search for training videos uploaded by the athlete or team. Returns videos with metadata and session information.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for video content',
          },
          sessionId: {
            type: 'string',
            description: 'Filter videos by specific training session',
          },
          dateFrom: {
            type: 'string',
            description: 'Filter videos from this date (YYYY-MM-DD)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of videos to return (default: 5)',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchCoachNotes',
      description: 'Search for notes and feedback written by coaches about the athlete. Returns coach observations, recommendations, and progress notes.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for coach notes content',
          },
          dateFrom: {
            type: 'string',
            description: 'Filter notes from this date (YYYY-MM-DD)',
          },
          coachName: {
            type: 'string',
            description: 'Filter notes by specific coach',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchBoatSetup',
      description: 'Search for boat rigging configurations and tuning guides for specific conditions. Returns recommended settings for different wind speeds and sea states.',
      parameters: {
        type: 'object',
        properties: {
          windSpeed: {
            type: 'number',
            description: 'Wind speed in knots',
          },
          windCondition: {
            type: 'string',
            enum: ['light', 'medium', 'heavy', 'storm'],
            description: 'Wind condition category',
          },
          waveHeight: {
            type: 'number',
            description: 'Wave height in meters',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchWeather',
      description: 'Get weather forecast for a specific location and date. Returns wind, temperature, sea state, and other conditions.',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'Location name or coordinates',
          },
          date: {
            type: 'string',
            description: 'Date for forecast (YYYY-MM-DD)',
          },
        },
        required: ['location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchTrainingReports',
      description: 'Search for past training session reports with objectives, execution details, and outcomes.',
      parameters: {
        type: 'object',
        properties: {
          dateFrom: {
            type: 'string',
            description: 'Start date for search (YYYY-MM-DD)',
          },
          dateTo: {
            type: 'string',
            description: 'End date for search (YYYY-MM-DD)',
          },
          status: {
            type: 'string',
            enum: ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            description: 'Filter by session status',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchPerformanceReports',
      description: 'Search for performance analytics reports with metrics, scores, and progress tracking.',
      parameters: {
        type: 'object',
        properties: {
          metric: {
            type: 'string',
            description: 'Specific metric to analyze (e.g., "upwind speed", "tacking efficiency")',
          },
          dateFrom: {
            type: 'string',
            description: 'Start date for analysis (YYYY-MM-DD)',
          },
          dateTo: {
            type: 'string',
            description: 'End date for analysis (YYYY-MM-DD)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchGPS',
      description: 'Search for GPS tracking data from training sessions. Returns track lines, speed data, angles, and maneuvers.',
      parameters: {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            description: 'Specific session ID to retrieve GPS data',
          },
          maneuverType: {
            type: 'string',
            enum: ['tack', 'gybe', 'mark_rounding', 'start'],
            description: 'Filter by specific maneuver type',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchVideoAnalysis',
      description: 'Get AI-powered video analysis results with technique breakdown, timestamps, and improvement suggestions.',
      parameters: {
        type: 'object',
        properties: {
          videoId: {
            type: 'string',
            description: 'Specific video ID to analyze',
          },
          analysisType: {
            type: 'string',
            enum: ['technique', 'boat_handling', 'crew_movement', 'speed_analysis'],
            description: 'Type of analysis to perform',
          },
        },
        required: ['videoId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchCompetitionHistory',
      description: 'Search for past competition results, rankings, and regatta performance.',
      parameters: {
        type: 'object',
        properties: {
          eventName: {
            type: 'string',
            description: 'Name of the regatta or competition',
          },
          year: {
            type: 'number',
            description: 'Year of competition',
          },
          dateFrom: {
            type: 'string',
            description: 'Start date for search (YYYY-MM-DD)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchKnowledgeBase',
      description: 'Search the documents coaches/admins have uploaded to the SAILVEX knowledge base (methodology, technique, tactics, boat setup, physical/mental prep) using vector similarity search. This is the athlete\'s own team reference material and may contradict or refine your general sailing knowledge — call this BEFORE answering any question in those categories, even if you think you already know the answer, since new documents are added regularly and take priority over built-in knowledge.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Natural language query for knowledge base search',
          },
          category: {
            type: 'string',
            enum: ['methodology', 'technique', 'tactics', 'boat_setup', 'physical_prep', 'mental_prep'],
            description: 'Category to filter results',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default: 3)',
          },
        },
        required: ['query'],
      },
    },
  },

  // ===== GENERATE TOOLS =====
  {
    type: 'function',
    function: {
      name: 'generateTrainingPlan',
      description: 'Generate a personalized multi-week training plan based on goals, current performance, and upcoming events.',
      parameters: {
        type: 'object',
        properties: {
          duration: {
            type: 'number',
            description: 'Duration in weeks (e.g., 4, 8, 12)',
          },
          focus: {
            type: 'string',
            description: 'Primary training focus (e.g., "boat speed", "starts", "tactics")',
          },
          targetEvent: {
            type: 'string',
            description: 'Target competition or event name',
          },
        },
        required: ['duration'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generateBriefing',
      description: 'Generate a pre-training or pre-race briefing document with objectives, conditions, and strategy.',
      parameters: {
        type: 'object',
        properties: {
          sessionType: {
            type: 'string',
            enum: ['training', 'race', 'practice_race'],
            description: 'Type of session',
          },
          objectives: {
            type: 'string',
            description: 'Main objectives for this session',
          },
          conditions: {
            type: 'string',
            description: 'Expected weather and sea conditions',
          },
        },
        required: ['sessionType'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generateDebriefing',
      description: 'Generate a post-training or post-race debriefing report with analysis, lessons learned, and action items.',
      parameters: {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            description: 'Session ID to generate debriefing for',
          },
          whatWorked: {
            type: 'string',
            description: 'What went well in this session',
          },
          whatDidntWork: {
            type: 'string',
            description: 'What needs improvement',
          },
        },
        required: ['sessionId'],
      },
    },
  },

  // ===== ACTION TOOLS =====
  {
    type: 'function',
    function: {
      name: 'createGoal',
      description: 'Create a new training goal or objective for the athlete with specific success criteria.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Goal title',
          },
          description: {
            type: 'string',
            description: 'Detailed goal description',
          },
          targetDate: {
            type: 'string',
            description: 'Target completion date (YYYY-MM-DD)',
          },
          successCriteria: {
            type: 'string',
            description: 'Measurable success criteria',
          },
        },
        required: ['title', 'description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'scheduleTraining',
      description: 'Schedule a new training session with objectives and planned exercises.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Training session title',
          },
          scheduledAt: {
            type: 'string',
            description: 'Scheduled date and time (ISO 8601)',
          },
          location: {
            type: 'string',
            description: 'Training location',
          },
          objectives: {
            type: 'string',
            description: 'Session objectives and focus',
          },
        },
        required: ['title', 'scheduledAt'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'comparePerformance',
      description: 'Compare performance metrics between two sessions or time periods to track progress.',
      parameters: {
        type: 'object',
        properties: {
          session1Id: {
            type: 'string',
            description: 'First session ID for comparison',
          },
          session2Id: {
            type: 'string',
            description: 'Second session ID for comparison',
          },
          metrics: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Specific metrics to compare (e.g., ["averageSpeed", "tackingEfficiency"])',
          },
        },
        required: ['session1Id', 'session2Id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recommendBoatSetup',
      description: 'Get personalized boat setup recommendations based on conditions, sailor weight, and skill level.',
      parameters: {
        type: 'object',
        properties: {
          windSpeed: {
            type: 'number',
            description: 'Expected wind speed in knots',
          },
          waveHeight: {
            type: 'number',
            description: 'Expected wave height in meters',
          },
          crewWeight: {
            type: 'number',
            description: 'Combined crew weight in kg',
          },
        },
        required: ['windSpeed'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recommendExercises',
      description: 'Get personalized exercise recommendations based on weaknesses, goals, and available time.',
      parameters: {
        type: 'object',
        properties: {
          weakness: {
            type: 'string',
            description: 'Specific weakness to address (e.g., "tacking efficiency", "downwind speed")',
          },
          availableTime: {
            type: 'number',
            description: 'Available training time in minutes',
          },
          conditions: {
            type: 'string',
            description: 'Expected training conditions',
          },
        },
        required: ['weakness'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recommendVideos',
      description: 'Recommend specific videos to watch based on learning objectives or technique improvement needs.',
      parameters: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'Topic or skill to learn (e.g., "mark roundings", "boat trim")',
          },
          skillLevel: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced', 'elite'],
            description: 'Current skill level',
          },
        },
        required: ['topic'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recommendLessons',
      description: 'Recommend Academy lessons based on current weaknesses, goals, or upcoming events.',
      parameters: {
        type: 'object',
        properties: {
          weakness: {
            type: 'string',
            description: 'Identified weakness or improvement area',
          },
          goal: {
            type: 'string',
            description: 'Current training goal',
          },
          priority: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: 'Priority level',
          },
        },
        required: [],
      },
    },
  },
];

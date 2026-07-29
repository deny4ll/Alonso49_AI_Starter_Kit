import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding athlete profiles with rich coaching context...');

  // Find the test athlete user
  const athlete = await prisma.user.findUnique({
    where: { email: 'atleta@alonso49.com' },
    include: { athleteProfile: true },
  });

  if (!athlete) {
    console.log('❌ Test athlete not found. Run create-test-users.sh first.');
    return;
  }

  console.log(`✅ Found athlete: ${athlete.firstName} ${athlete.lastName}`);

  // Update or create athlete profile with rich context
  const profileData = {
    birthDate: new Date('1998-05-15'),
    weight: 75.0,
    height: 180.0,
    sailNumber: 'ESP 49',
    nationality: 'España',
    position: 'Crew',
    experienceLevel: 'Advanced',
    assignedCoach: 'María González',
    seasonGoal: 'Clasificar para los Juegos Olímpicos de París 2024 - Top 10 en el Mundial',
    currentMicrocycle: 'Microciclo 3 - Preparación Pre-Competición (Semana 1 de 4)',
    weeklyObjectives: `1. Mejorar velocidad en ceñida con viento de 12-15 nudos
2. Perfeccionar sincronización en viradas bajo presión
3. Optimizar trimado de spinnaker en olas medianas
4. Incrementar resistencia física en sesiones largas (>3 horas)`,
    todayObjective: 'Trabajar timing en viradas - Objetivo: reducir pérdida de velocidad a menos de 0.5 nudos',
    kpis: {
      upwindSpeed: {
        current: 6.8,
        target: 7.2,
        unit: 'knots',
      },
      tackingEfficiency: {
        current: 82,
        target: 90,
        unit: '%',
      },
      downwindSpeed: {
        current: 11.5,
        target: 12.0,
        unit: 'knots',
      },
      gybeSuccess: {
        current: 88,
        target: 95,
        unit: '%',
      },
      startLineSuccess: {
        current: 65,
        target: 80,
        unit: '%',
      },
      avgPosition: {
        current: 8.3,
        target: 5.0,
        unit: 'position',
      },
    },
    nextEvent: 'Campeonato Europeo 49er - Hyères, Francia - 15-22 Agosto 2024',
    boatSetup: `Configuración actual (viento medio 12-15 nudos):
- Rake de mástil: 25.8 pies
- Tensión de obenques: 480 lbs
- Tensión de estay: 520 lbs  
- Traveller de mayor: 3 clicks a barlovento
- Cunningham: Medio
- Vang: Tenso en ceñida, suelto en popa`,
  };

  if (athlete.athleteProfile) {
    // Update existing profile
    await prisma.athleteProfile.update({
      where: { id: athlete.athleteProfile.id },
      data: profileData,
    });
    console.log('✅ Updated existing athlete profile');
  } else {
    // Create new profile
    await prisma.athleteProfile.create({
      data: {
        ...profileData,
        userId: athlete.id,
      },
    });
    console.log('✅ Created new athlete profile');
  }

  // Create a mock training session with analytics
  const existingSession = await prisma.session.findFirst({
    where: {
      createdById: athlete.id,
      title: 'Sesión de Viradas - Viento Medio',
    },
  });

  if (!existingSession) {
    const session = await prisma.session.create({
      data: {
        title: 'Sesión de Viradas - Viento Medio',
        description: 'Ejercicios analíticos enfocados en mejorar timing y sincronización en viradas. 40 viradas ejecutadas en condiciones de viento de 12-15 nudos.',
        status: 'COMPLETED',
        scheduledAt: new Date('2024-07-28T09:00:00Z'),
        startedAt: new Date('2024-07-28T09:15:00Z'),
        completedAt: new Date('2024-07-28T12:30:00Z'),
        location: 'Puerto de Valencia - Zona de entrenamiento A',
        windSpeed: 13.5,
        windDirection: 'NE',
        waveHeight: 0.8,
        createdById: athlete.id,
        weatherConditions: {
          temperature: 24,
          humidity: 65,
          visibility: 10,
          current: 'Moderado hacia el este',
        },
        analytics: {
          create: {
            totalDistance: 18.5,
            averageSpeed: 6.7,
            maxSpeed: 14.2,
            tackingEfficiency: 81.5,
            gybeCount: 8,
            tackCount: 40,
            performanceScore: 78.5,
            insights: {
              strengths: [
                'Buena velocidad en ceñida en viento estable',
                'Excelente comunicación entre proa y popa',
                'Recuperación rápida post-virada en condiciones óptimas',
              ],
              weaknesses: [
                'Pérdida de velocidad excesiva en viradas con ola (>1.2 nudos)',
                'Timing inconsistente en rachas - necesita anticipación',
                'Trimado post-virada demasiado tardío',
              ],
              recommendations: [
                'Practicar viradas en condiciones de ola durante próxima semana',
                'Trabajar comunicación verbal en rachas y rollos',
                'Revisar video para analizar posición corporal en momento de virada',
              ],
            },
          },
        },
      },
      include: {
        analytics: true,
      },
    });

    console.log('✅ Created mock training session with analytics');

    // Add coach feedback to session
    const coach = await prisma.user.findUnique({
      where: { email: 'coach@alonso49.com' },
    });

    if (coach) {
      await prisma.feedback.create({
        data: {
          content: `Excelente progreso en la sesión de hoy, Juan. Tus viradas están mejorando consistentemente.

**Puntos Fuertes:**
- He notado una mejora del 8% en efficiency comparado con la semana pasada
- La velocidad promedio en ceñida está muy cerca del target (6.7 vs 7.2 knots)
- Buena lectura del viento en la zona norte del campo

**Áreas de Mejora:**
- Necesitas trabajar el timing en las viradas cuando hay ola. Pierdes más de 1 nudo en condiciones de ola >0.5m
- El trimado del foque post-virada es tardío. Debes cazarlo 0.5 segundos antes
- Revisa el video a partir del minuto 42:15 - tu peso corporal está demasiado a popa en el momento crítico

**Ejercicio para mañana:**
Vamos a hacer el drill "Viradas en Escalera" con olas simuladas. 20 viradas en 10 minutos, enfocados solo en timing.

**Objetivo específico:** Reducir pérdida de velocidad a menos de 0.8 nudos por virada.

Buen trabajo hoy. Nos vemos mañana a las 09:00.`,
          rating: 4,
          sessionId: session.id,
          coachId: coach.id,
        },
      });

      console.log('✅ Created coach feedback for session');
    }

    // Create mock videos
    await prisma.video.create({
      data: {
        title: 'Análisis de Viradas - Ángulo de Proa',
        description: 'Video grabado desde proa mostrando técnica de virada y movimientos de tripulación',
        url: 'https://example.com/videos/tacking-analysis-bow.mp4',
        status: 'READY',
        duration: 180,
        format: 'mp4',
        uploadedById: athlete.id,
        sessionId: session.id,
      },
    });

    await prisma.video.create({
      data: {
        title: 'Sesión Completa - Vista Lateral',
        description: 'Grabación completa de la sesión desde coach boat',
        url: 'https://example.com/videos/full-session-lateral.mp4',
        status: 'READY',
        duration: 3600,
        format: 'mp4',
        uploadedById: athlete.id,
        sessionId: session.id,
      },
    });

    console.log('✅ Created mock training videos');
  } else {
    console.log('ℹ️  Mock session already exists, skipping...');
  }

  console.log('\n✅ Athlete profile seeding complete!');
  console.log('\n📊 Summary:');
  console.log('   - Athlete: Juan Pérez');
  console.log('   - Age: 26 years');
  console.log('   - Position: Crew');
  console.log('   - Experience: Advanced');
  console.log('   - Season Goal: Qualify for Olympics');
  console.log('   - Last Session: Tacking drills (78.5/100 score)');
  console.log('   - Next Event: European Championship (Aug 15-22)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding athlete profiles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

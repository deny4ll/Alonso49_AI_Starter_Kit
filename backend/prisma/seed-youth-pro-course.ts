import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const YOUTH_PRO_MODULES = [
  {
    order: 1,
    title: 'Control del Barco y Seguridad Avanzada',
    description: 'Dominio de conducción en trapecio y protocolos de seguridad.',
    content: `Dominio de conducción en trapecio, gestión del trimado a alta velocidad y
protocolos de volcada/recuperación para proteger la integridad del deportista y el material.`,
  },
  {
    order: 2,
    title: 'Estandarización de Maniobras (SOP)',
    description: 'Sincronización patrón/tripulante y comunicación con Key Words.',
    content: `Sincronización milimétrica entre patrón y tripulante en viradas, trasluchadas y
tomadas de boya. Definición de roles y comunicación con palabras clave (Key Words).`,
  },
  {
    order: 3,
    title: 'Configuración y Puesta a Punto del Aparejo',
    description: 'Tensiómetros, tablas de reglaje por TWS y mantenimiento preventivo.',
    content: `Aprendizaje en el manejo de tensiómetros, tablas de reglaje según rango de
viento (TWS) y mantenimiento preventivo de cabuyería y herrajes.`,
  },
  {
    order: 4,
    title: 'Análisis de Datos y Telemetría Inicial',
    description: 'Introducción a Vakaros/GPS/vídeo para medir VMG real.',
    content: `Introducción a herramientas como Vakaros o GPS/vídeo. Aprendizaje para
interpretar trazas, evaluar pérdidas en maniobra y medir VMG real.`,
  },
  {
    order: 5,
    title: 'Hábitos Profesionales y "Día Tipo"',
    description: 'Rutinas de preparación, briefing/debriefing y nutrición.',
    content: `Rutinas estandarizadas de preparación en tierra, briefing pre-salida,
nutrición/hidratación en el agua y debrief diario estructurado.`,
  },
];

const COURSE_TITLE = 'APG Youth Pro Program';

const COURSE_DESCRIPTION =
  'Programa de transición y alto rendimiento para jóvenes promesas hacia el 49er, ' +
  'adaptando la Metodología Alonso 49 para regatistas que dan el salto desde clases ' +
  'de cantera (29er, 420, ILCA). Disponible en dos modalidades: APG Youth Transition ' +
  'Clinic (evento intensivo presencial de 3-5 días) y APG Young Pro Mentoring ' +
  '(tutorización continua anual/mensual con seguimiento online).';

async function main() {
  console.log('🌱 Seeding APG Youth Pro Program course...');

  const academyUser = await prisma.user.findUnique({
    where: { email: 'academia@alonso49.com' },
    include: { academyProfile: true },
  });

  if (!academyUser) {
    console.log('❌ Test academy user not found. Run create-test-users.sh first.');
    return;
  }

  const academyProfile = academyUser.academyProfile
    ? academyUser.academyProfile
    : await prisma.academyProfile.create({
        data: {
          userId: academyUser.id,
          name: 'Alonso Performance Group',
          country: 'España',
        },
      });

  console.log(`✅ Using academy profile: ${academyProfile.name}`);

  const existingCourse = await prisma.course.findFirst({
    where: { title: COURSE_TITLE, academyId: academyProfile.id },
    include: { modules: true },
  });

  const course = existingCourse
    ? await prisma.course.update({
        where: { id: existingCourse.id },
        data: { description: COURSE_DESCRIPTION, isPublished: true },
      })
    : await prisma.course.create({
        data: {
          title: COURSE_TITLE,
          description: COURSE_DESCRIPTION,
          price: 0,
          currency: 'USD',
          isPublished: true,
          academyId: academyProfile.id,
        },
      });

  for (const mod of YOUTH_PRO_MODULES) {
    const existingModule = existingCourse?.modules.find((m) => m.order === mod.order);
    if (existingModule) {
      await prisma.courseModule.update({ where: { id: existingModule.id }, data: mod });
    } else {
      await prisma.courseModule.create({ data: { ...mod, courseId: course.id } });
    }
  }

  console.log(`✅ Synced course "${course.title}" with ${YOUTH_PRO_MODULES.length} modules`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

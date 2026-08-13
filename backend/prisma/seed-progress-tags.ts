import { PrismaClient, TagLevel } from '@prisma/client';

const prisma = new PrismaClient();

// Taxonomía fija del Área de Progreso (Metodología Alonso49). Jerarquía de 2
// niveles: sección -> subsecciones. Se usa para etiquetar Videos/Informes y
// calcular el progreso acumulado por área.
const TAXONOMY: { key: string; label: string; children: { key: string; label: string }[] }[] = [
  {
    key: 'team-set-up',
    label: 'Team Set Up',
    children: [
      { key: 'trimado-mastil', label: 'Trimado mástil' },
      { key: 'preparacion-barco-pick-event', label: 'Preparación barco pick event' },
      { key: 'trimado-vela', label: 'Trimado vela' },
      { key: 'eleccion-compra-material', label: 'Elección / compra de material para la temporada' },
    ],
  },
  {
    key: 'team-performance',
    label: 'Team Performance',
    children: [
      { key: 'comunicacion', label: 'Comunicación' },
      { key: 'boat-speed', label: 'Boat speed' },
      { key: 'body-language', label: 'Body language' },
      { key: 'vmg-modos', label: 'VMG modos' },
    ],
  },
  {
    key: 'condiciones-de-viento',
    label: 'Condiciones de Viento',
    children: [
      { key: 'light-wind', label: 'Light wind' },
      { key: 'medium-wind', label: 'Medium wind' },
      { key: 'strong-wind', label: 'Strong wind' },
    ],
  },
  {
    key: 'boat-handling',
    label: 'Boat Handling',
    children: [
      { key: 'tacking-light-wind', label: 'Tacking - Light wind' },
      { key: 'tacking-medium-wind', label: 'Tacking - Medium wind' },
      { key: 'tacking-heavy-wind', label: 'Tacking - Heavy wind' },
      { key: 'gybing-light-wind', label: 'Gybing - Light wind' },
      { key: 'gybing-medium-wind', label: 'Gybing - Medium wind' },
      { key: 'gybing-heavy-wind', label: 'Gybing - Heavy wind' },
    ],
  },
  {
    key: 'mark-rounding',
    label: 'Mark Rounding',
    children: [
      { key: 'eights', label: 'Eights' },
      { key: 'inverted-triangle', label: 'Inverted triangle' },
      { key: '3-laps-racing-short-course', label: '3 Laps racing short course' },
      { key: 'racing-mode', label: 'Racing mode' },
    ],
  },
  {
    key: 'planificacion-y-tactica',
    label: 'Planificación y Táctica',
    children: [
      { key: 'pre-start-routine', label: 'Pre start routine' },
      { key: 'tactics-upwind', label: 'Tactics - Upwind' },
      { key: 'tactics-downwind', label: 'Tactics - Downwind' },
      { key: 'strategy-plan-upwind', label: 'Strategy plan - Upwind' },
      { key: 'strategy-plan-downwind', label: 'Strategy plan - Downwind' },
      { key: 'day-type-analysis', label: 'Day type analysis' },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding taxonomía Área de Progreso (Alonso49)...');

  for (let sectionOrder = 0; sectionOrder < TAXONOMY.length; sectionOrder++) {
    const section = TAXONOMY[sectionOrder];

    const sectionTag = await prisma.tag.upsert({
      where: { key: section.key },
      update: { label: section.label, level: TagLevel.SECTION, order: sectionOrder },
      create: {
        key: section.key,
        label: section.label,
        level: TagLevel.SECTION,
        order: sectionOrder,
      },
    });

    for (let childOrder = 0; childOrder < section.children.length; childOrder++) {
      const child = section.children[childOrder];
      await prisma.tag.upsert({
        where: { key: child.key },
        update: {
          label: child.label,
          level: TagLevel.SUBSECTION,
          order: childOrder,
          parentId: sectionTag.id,
        },
        create: {
          key: child.key,
          label: child.label,
          level: TagLevel.SUBSECTION,
          order: childOrder,
          parentId: sectionTag.id,
        },
      });
    }

    console.log(`✅ ${section.label} (${section.children.length} subsecciones)`);
  }

  const total = await prisma.tag.count();
  console.log(`🌊 Listo. ${total} tags en total (${TAXONOMY.length} secciones).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

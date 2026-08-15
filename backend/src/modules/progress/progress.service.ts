import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TagLevel } from '@prisma/client';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  /**
   * Progreso acumulado por sección/subsección de la Metodología SAILVEX.
   * "Progreso" = cantidad de videos/informes etiquetados en cada área.
   * Si no se pasa teamId, se intenta resolver el equipo del atleta; si no
   * tiene equipo, se calcula a nivel individual (solo su propio contenido).
   */
  async getSummary({ userId, teamId }: { userId: string; teamId?: string }) {
    let scopeTeamId = teamId;
    if (!scopeTeamId) {
      const athleteProfile = await this.prisma.athleteProfile.findUnique({ where: { userId } });
      scopeTeamId = athleteProfile?.teamId ?? undefined;
    }

    const contentWhere = scopeTeamId
      ? { teamId: scopeTeamId, deletedAt: null }
      : { uploadedById: userId, deletedAt: null };

    const [sections, videoTags] = await Promise.all([
      this.prisma.tag.findMany({
        where: { level: TagLevel.SECTION },
        orderBy: { order: 'asc' },
        include: { children: { orderBy: { order: 'asc' } } },
      }),
      this.prisma.videoTag.findMany({
        where: { video: contentWhere },
        select: { tagId: true },
      }),
    ]);

    const countByTag = new Map<string, number>();
    for (const vt of videoTags) {
      countByTag.set(vt.tagId, (countByTag.get(vt.tagId) ?? 0) + 1);
    }

    const result = sections.map((section) => {
      const subsections = section.children.map((child) => ({
        id: child.id,
        key: child.key,
        label: child.label,
        entries: countByTag.get(child.id) ?? 0,
      }));
      const entries = (countByTag.get(section.id) ?? 0) + subsections.reduce((sum, s) => sum + s.entries, 0);
      return {
        id: section.id,
        key: section.key,
        label: section.label,
        entries,
        subsections,
      };
    });

    return {
      scope: scopeTeamId ? 'team' : 'athlete',
      teamId: scopeTeamId ?? null,
      totalEntries: result.reduce((sum, s) => sum + s.entries, 0),
      sections: result,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TagLevel } from '@prisma/client';

const NIVEL_WINDOW = 5;
const TREND_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

interface ScoredEntry {
  score: number;
  note: string | null;
  createdAt: Date;
  videoTitle: string;
}

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  /**
   * Progreso acumulado por sección/subsección de la Metodología SAILVEX.
   * Dos medidas independientes por área (ver propuesta "Nivel por Área"):
   *  - "entries"/"percentage": carga de trabajo, cantidad de videos/informes
   *    etiquetados (mide esfuerzo/foco).
   *  - "nivel": puntaje 0-10 del AI Coach, promedio pesado (más peso a lo
   *    reciente) de las últimas NIVEL_WINDOW entradas puntuadas de esa
   *    subárea (mide qué tan bien lo hace el atleta). null si no hay
   *    entradas puntuadas todavía ("sin datos", no un 0 falso).
   *  - "nivelDelta": nivel actual vs. nivel calculado solo con entradas de
   *    hace 30+ días, para mostrar tendencia.
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
        select: { tagId: true, score: true, note: true, createdAt: true, video: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const countByTag = new Map<string, number>();
    const scoredEntriesByTag = new Map<string, ScoredEntry[]>();
    for (const vt of videoTags) {
      countByTag.set(vt.tagId, (countByTag.get(vt.tagId) ?? 0) + 1);
      if (vt.score == null) continue;
      if (!scoredEntriesByTag.has(vt.tagId)) scoredEntriesByTag.set(vt.tagId, []);
      scoredEntriesByTag
        .get(vt.tagId)!
        .push({ score: vt.score, note: vt.note, createdAt: vt.createdAt, videoTitle: vt.video.title });
    }

    const now = Date.now();
    const nivelOf = (entries: ScoredEntry[]) => this.weightedAverage(entries.slice(0, NIVEL_WINDOW));
    const nivelTrendAgoOf = (entries: ScoredEntry[]) =>
      this.weightedAverage(
        entries.filter((e) => now - e.createdAt.getTime() >= TREND_WINDOW_MS).slice(0, NIVEL_WINDOW),
      );
    const rollUp = (values: (number | null)[]) => {
      const present = values.filter((v): v is number => v != null);
      return present.length ? this.round1(present.reduce((a, b) => a + b, 0) / present.length) : null;
    };

    const result = sections.map((section) => {
      const subsections = section.children.map((child) => {
        const entries = scoredEntriesByTag.get(child.id) ?? [];
        const nivel = nivelOf(entries);
        const nivelAgo = nivelTrendAgoOf(entries);
        return {
          id: child.id,
          key: child.key,
          label: child.label,
          entries: countByTag.get(child.id) ?? 0,
          nivel,
          nivelDelta: nivel != null && nivelAgo != null ? this.round1(nivel - nivelAgo) : null,
          recentEntries: entries.slice(0, NIVEL_WINDOW).map((e) => ({
            title: e.videoTitle,
            score: e.score,
            note: e.note,
            createdAt: e.createdAt,
          })),
        };
      });

      const entries = (countByTag.get(section.id) ?? 0) + subsections.reduce((sum, s) => sum + s.entries, 0);
      const nivel = rollUp(subsections.map((s) => s.nivel));
      const nivelAgo = rollUp(
        subsections.map((s) => (s.nivel != null && s.nivelDelta != null ? this.round1(s.nivel - s.nivelDelta) : null)),
      );

      return {
        id: section.id,
        key: section.key,
        label: section.label,
        entries,
        nivel,
        nivelDelta: nivel != null && nivelAgo != null ? this.round1(nivel - nivelAgo) : null,
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

  /** Promedio pesado: la entrada más reciente (índice 0) pesa más. */
  private weightedAverage(entries: ScoredEntry[]): number | null {
    if (entries.length === 0) return null;
    const n = entries.length;
    let weightedSum = 0;
    let totalWeight = 0;
    entries.forEach((entry, i) => {
      const weight = n - i;
      weightedSum += entry.score * weight;
      totalWeight += weight;
    });
    return this.round1(weightedSum / totalWeight);
  }

  private round1(value: number): number {
    return Math.round(value * 10) / 10;
  }
}

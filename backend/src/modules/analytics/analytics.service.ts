import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VideosService } from '../videos/videos.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private videosService: VideosService,
  ) {}

  async getSessionAnalytics(sessionId: string) {
    return this.prisma.sessionAnalytics.findUnique({
      where: { sessionId },
      include: { session: true },
    });
  }

  async createSessionAnalytics(sessionId: string, data: any) {
    return this.prisma.sessionAnalytics.create({
      data: { sessionId, ...data },
    });
  }

  async getUserStats(userId: string) {
    const sessions = await this.prisma.session.count({
      where: { createdById: userId },
    });

    const videos = await this.prisma.video.count({
      where: { uploadedById: userId },
    });

    const completedSessions = await this.prisma.session.findMany({
      where: { createdById: userId, status: 'COMPLETED' },
      select: { completedAt: true, scheduledAt: true },
    });

    const waterDates = new Set(
      completedSessions
        .map((s) => s.completedAt ?? s.scheduledAt)
        .filter((d): d is Date => !!d)
        .map((d) => d.toISOString().slice(0, 10)),
    );

    const daysOnWater = waterDates.size;
    const { monthsSpan, restDays } = this.computeSpanAndRest(waterDates);
    const monthlyAvgDaysOnWater = monthsSpan > 0 ? Math.round((daysOnWater / monthsSpan) * 10) / 10 : 0;

    const aiCoachHours = await this.getAiCoachHours(userId);

    return {
      sessions,
      videos,
      daysOnWater,
      monthlyAvgDaysOnWater,
      restDays,
      aiCoachHours,
    };
  }

  async getBenchmark(teamId: string) {
    return this.prisma.teamBenchmark.findFirst({ where: { teamId }, orderBy: { updatedAt: 'desc' } });
  }

  async upsertBenchmark(teamId: string, data: any) {
    const existing = await this.prisma.teamBenchmark.findFirst({ where: { teamId } });
    if (existing) {
      return this.prisma.teamBenchmark.update({ where: { id: existing.id }, data });
    }
    return this.prisma.teamBenchmark.create({ data: { ...data, teamId } });
  }

  async getBigPicture(teamId: string) {
    return this.prisma.progressSummary.findFirst({ where: { teamId }, orderBy: { updatedAt: 'desc' } });
  }

  async upsertBigPicture(teamId: string, content: string, userId: string) {
    const existing = await this.prisma.progressSummary.findFirst({ where: { teamId } });
    if (existing) {
      return this.prisma.progressSummary.update({
        where: { id: existing.id },
        data: { content, updatedById: userId },
      });
    }
    return this.prisma.progressSummary.create({ data: { teamId, content, updatedById: userId } });
  }

  /** Compara el rendimiento real (promedio de SessionAnalytics del equipo) contra el benchmark. */
  async getTeamComparison(teamId: string) {
    const [benchmark, analytics] = await Promise.all([
      this.getBenchmark(teamId),
      this.prisma.sessionAnalytics.findMany({
        where: { session: { teamId, deletedAt: null } },
      }),
    ]);

    const avg = (values: (number | null | undefined)[]) => {
      const nums = values.filter((v): v is number => v != null);
      return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100 : null;
    };

    return {
      benchmark,
      actual: {
        averageSpeed: avg(analytics.map((a) => a.averageSpeed)),
        maxSpeed: avg(analytics.map((a) => a.maxSpeed)),
        tackingEfficiency: avg(analytics.map((a) => a.tackingEfficiency)),
        performanceScore: avg(analytics.map((a) => a.performanceScore)),
      },
    };
  }

  /**
   * Estadísticas de un equipo para comparar contra otros equipos: sesiones subidas
   * vs completadas, días entrenados/descanso, videos/informes subidos, horas de AI
   * Coach (suma de todos los miembros) y distribución de carga por área de trabajo.
   */
  async getTeamStats(teamId: string) {
    const [sessionsTotal, sessionsCompleted, videos, loadDistribution, members] = await Promise.all([
      this.prisma.session.count({ where: { teamId, deletedAt: null } }),
      this.prisma.session.count({ where: { teamId, deletedAt: null, status: 'COMPLETED' } }),
      this.prisma.video.count({ where: { teamId, deletedAt: null } }),
      this.videosService.getLoadDistribution({ teamId }),
      this.prisma.teamMember.findMany({ where: { teamId }, select: { userId: true } }),
    ]);

    const completedSessions = await this.prisma.session.findMany({
      where: { teamId, deletedAt: null, status: 'COMPLETED' },
      select: { completedAt: true, scheduledAt: true },
    });

    const trainingDates = new Set(
      completedSessions
        .map((s) => s.completedAt ?? s.scheduledAt)
        .filter((d): d is Date => !!d)
        .map((d) => d.toISOString().slice(0, 10)),
    );
    const trainingDays = trainingDates.size;
    const { restDays } = this.computeSpanAndRest(trainingDates);

    const memberHours = await Promise.all(members.map((m) => this.getAiCoachHours(m.userId)));
    const aiCoachHours = Math.round(memberHours.reduce((sum, h) => sum + h, 0) * 10) / 10;

    return {
      teamId,
      sessionsTotal,
      sessionsCompleted,
      videos,
      trainingDays,
      restDays,
      aiCoachHours,
      memberCount: members.length,
      workAreas: loadDistribution.sections.map((s) => ({
        key: s.key,
        label: s.label,
        percentage: s.percentage,
      })),
    };
  }

  /** Compara las estadísticas de dos o más equipos, uno al lado del otro. */
  async compareTeams(teamIds: string[]) {
    const teams = await this.prisma.team.findMany({
      where: { id: { in: teamIds } },
      select: { id: true, name: true },
    });

    const stats = await Promise.all(teamIds.map((teamId) => this.getTeamStats(teamId)));

    return teamIds.map((teamId, i) => ({
      team: teams.find((t) => t.id === teamId) ?? { id: teamId, name: 'Equipo' },
      stats: stats[i],
    }));
  }

  private computeSpanAndRest(waterDates: Set<string>) {
    if (waterDates.size === 0) return { monthsSpan: 0, restDays: 0 };

    const sorted = Array.from(waterDates).sort();
    const first = new Date(sorted[0]);
    const last = new Date(sorted[sorted.length - 1]);
    const totalDaysInSpan = Math.round((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return {
      monthsSpan: Math.max(1, totalDaysInSpan / 30),
      restDays: Math.max(0, totalDaysInSpan - waterDates.size),
    };
  }

  private async getAiCoachHours(userId: string) {
    const sessions = await this.prisma.aiCoachSession.findMany({
      where: { userId },
      select: { startedAt: true, lastActivityAt: true },
    });

    const totalMs = sessions.reduce(
      (sum, s) => sum + Math.max(0, s.lastActivityAt.getTime() - s.startedAt.getTime()),
      0,
    );

    return Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10;
  }
}

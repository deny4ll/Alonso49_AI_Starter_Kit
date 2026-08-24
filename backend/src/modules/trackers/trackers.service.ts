import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface TrackPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number;
}

// GPX <speed> (y el fallback distancia/tiempo) vienen en m/s; toda la plataforma
// muestra velocidades en nudos ("nudos" en sesiones, benchmarks, etc.), así que
// se convierte una sola vez acá al ingestar el tracker.
const MS_TO_KNOTS = 1.9438445;

@Injectable()
export class TrackersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    const { points, sessionId, source, originalFileName } = data;
    if (!Array.isArray(points) || points.length < 2) {
      throw new BadRequestException('El tracker necesita al menos 2 puntos GPS');
    }

    const summary = this.computeSummary(points as TrackPoint[]);

    let teamId: string | undefined;
    if (sessionId) {
      const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
      teamId = session?.teamId ?? undefined;
    }
    if (!teamId) {
      const athleteProfile = await this.prisma.athleteProfile.findUnique({ where: { userId } });
      teamId = athleteProfile?.teamId ?? undefined;
    }

    const track = await this.prisma.gpsTrack.create({
      data: {
        sessionId,
        uploadedById: userId,
        teamId,
        source,
        originalFileName,
        points,
        ...summary,
      },
    });

    // Si el tracker quedó vinculado a una sesión, el rendimiento real medido por
    // GPS (velocidad media/máxima, distancia) pasa a alimentar SessionAnalytics
    // automáticamente, que es de donde salen las comparaciones de Estadísticas.
    // Sin esto, subir un tracker no tenía ningún efecto visible en el resto de la
    // plataforma.
    if (sessionId && (summary.averageSpeed != null || summary.maxSpeed != null)) {
      await this.prisma.sessionAnalytics.upsert({
        where: { sessionId },
        create: {
          sessionId,
          totalDistance: summary.distanceMeters != null ? Math.round(summary.distanceMeters / 10) / 100 : undefined,
          averageSpeed: summary.averageSpeed ?? undefined,
          maxSpeed: summary.maxSpeed ?? undefined,
        },
        update: {
          totalDistance: summary.distanceMeters != null ? Math.round(summary.distanceMeters / 10) / 100 : undefined,
          averageSpeed: summary.averageSpeed ?? undefined,
          maxSpeed: summary.maxSpeed ?? undefined,
        },
      });
    }

    return track;
  }

  async findAll(filters: { sessionId?: string; teamId?: string; userId?: string }) {
    return this.prisma.gpsTrack.findMany({
      where: {
        ...(filters.sessionId && { sessionId: filters.sessionId }),
        ...(filters.teamId && { teamId: filters.teamId }),
        ...(!filters.sessionId && !filters.teamId && filters.userId && { uploadedById: filters.userId }),
      },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.gpsTrack.findUnique({ where: { id } });
  }

  private computeSummary(points: TrackPoint[]) {
    let distanceMeters = 0;
    let maxSpeedMs = 0;
    const speedsMs: number[] = [];

    for (let i = 1; i < points.length; i++) {
      distanceMeters += this.haversine(points[i - 1], points[i]);
      if (points[i].speed != null) {
        speedsMs.push(points[i].speed as number);
        maxSpeedMs = Math.max(maxSpeedMs, points[i].speed as number);
      }
    }

    const first = points[0];
    const last = points[points.length - 1];
    const durationSeconds = Math.max(
      0,
      Math.round((new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) / 1000),
    );

    // m/s: de los puntos GPS si traen <speed>, si no, distancia/tiempo del recorrido.
    const averageSpeedMs = speedsMs.length
      ? speedsMs.reduce((a, b) => a + b, 0) / speedsMs.length
      : durationSeconds > 0
        ? distanceMeters / durationSeconds
        : null;

    const toKnots = (ms: number) => Math.round(ms * MS_TO_KNOTS * 100) / 100;

    return {
      distanceMeters: Math.round(distanceMeters),
      durationSeconds,
      averageSpeed: averageSpeedMs != null ? toKnots(averageSpeedMs) : null,
      maxSpeed: maxSpeedMs ? toKnots(maxSpeedMs) : null,
      startedAt: first.timestamp ? new Date(first.timestamp) : null,
    };
  }

  private haversine(a: TrackPoint, b: TrackPoint) {
    const EARTH_RADIUS_M = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
  }
}

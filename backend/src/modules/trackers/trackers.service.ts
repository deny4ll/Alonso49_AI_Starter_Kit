import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface TrackPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number;
}

@Injectable()
export class TrackersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    const { points, sessionId, source, originalFileName } = data;
    if (!Array.isArray(points) || points.length < 2) {
      throw new BadRequestException('El tracker necesita al menos 2 puntos GPS');
    }

    const summary = this.computeSummary(points as TrackPoint[]);

    return this.prisma.gpsTrack.create({
      data: {
        sessionId,
        uploadedById: userId,
        source,
        originalFileName,
        points,
        ...summary,
      },
    });
  }

  async findAll(filters: { sessionId?: string; userId?: string }) {
    return this.prisma.gpsTrack.findMany({
      where: {
        ...(filters.sessionId && { sessionId: filters.sessionId }),
        ...(!filters.sessionId && filters.userId && { uploadedById: filters.userId }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.gpsTrack.findUnique({ where: { id } });
  }

  private computeSummary(points: TrackPoint[]) {
    let distanceMeters = 0;
    let maxSpeed = 0;
    const speeds: number[] = [];

    for (let i = 1; i < points.length; i++) {
      distanceMeters += this.haversine(points[i - 1], points[i]);
      if (points[i].speed != null) {
        speeds.push(points[i].speed as number);
        maxSpeed = Math.max(maxSpeed, points[i].speed as number);
      }
    }

    const first = points[0];
    const last = points[points.length - 1];
    const durationSeconds = Math.max(
      0,
      Math.round((new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) / 1000),
    );

    const averageSpeed = speeds.length
      ? speeds.reduce((a, b) => a + b, 0) / speeds.length
      : durationSeconds > 0
        ? distanceMeters / durationSeconds
        : null;

    return {
      distanceMeters: Math.round(distanceMeters),
      durationSeconds,
      averageSpeed: averageSpeed != null ? Math.round(averageSpeed * 100) / 100 : null,
      maxSpeed: maxSpeed || null,
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

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    return this.prisma.session.create({
      data: {
        ...data,
        createdById: userId,
      },
      include: {
        videos: true,
        feedback: true,
      },
    });
  }

  async findAll(filters?: any) {
    return this.prisma.session.findMany({
      where: {
        deletedAt: null,
        ...filters,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        videos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.session.findUnique({
      where: { id },
      include: {
        createdBy: true,
        team: true,
        videos: true,
        feedback: true,
        analytics: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.session.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.session.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /** Búsqueda con filtros compartida con el buscador ("lupa") del AI Coach. */
  async search(filters: {
    q?: string;
    windMin?: number;
    windMax?: number;
    dateFrom?: string;
    dateTo?: string;
    location?: string;
    mine?: boolean;
    userId?: string;
  }) {
    const { q, windMin, windMax, dateFrom, dateTo, location, mine, userId } = filters;

    return this.prisma.session.findMany({
      where: {
        deletedAt: null,
        ...(mine && userId && { createdById: userId }),
        ...(location && { location: { contains: location, mode: 'insensitive' } }),
        ...((windMin !== undefined || windMax !== undefined) && {
          windSpeed: {
            ...(windMin !== undefined && { gte: windMin }),
            ...(windMax !== undefined && { lte: windMax }),
          },
        }),
        ...((dateFrom || dateTo) && {
          scheduledAt: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }),
        ...(q && {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }),
      },
      include: { videos: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

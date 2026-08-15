import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { TagLevel } from '@prisma/client';

export interface VideoQueryFilters {
  type?: string;
  sessionId?: string;
  teamId?: string;
  tagKey?: string;
  location?: string;
  q?: string;
  dateFrom?: string;
  dateTo?: string;
  windMin?: number;
  windMax?: number;
  mine?: boolean;
  userId?: string;
}

@Injectable()
export class VideosService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async createFromUpload(file: Express.Multer.File, body: Record<string, string>, userId: string) {
    const url = await this.storage.uploadFile(file.buffer, file.originalname, file.mimetype);

    const tagIds = body.tagIds ? JSON.parse(body.tagIds) : undefined;

    return this.create(
      {
        type: 'VIDEO',
        title: body.title,
        description: body.description || undefined,
        feedback: body.feedback || undefined,
        sessionId: body.sessionId || undefined,
        url,
        format: file.mimetype,
        size: file.size,
        status: 'READY',
        tagIds,
      },
      userId,
    );
  }

  async create(data: any, userId: string) {
    const { tagIds, ...videoData } = data;
    if (videoData.recordedAt) {
      videoData.recordedAt = new Date(videoData.recordedAt);
    }

    let teamId: string | undefined;
    if (videoData.sessionId) {
      const session = await this.prisma.session.findUnique({ where: { id: videoData.sessionId } });
      if (session) {
        teamId = session.teamId ?? undefined;
        videoData.location = videoData.location ?? session.location ?? undefined;
        videoData.windSpeed = videoData.windSpeed ?? session.windSpeed ?? undefined;
        videoData.waveHeight = videoData.waveHeight ?? session.waveHeight ?? undefined;
      }
    }
    if (!teamId) {
      const athleteProfile = await this.prisma.athleteProfile.findUnique({ where: { userId } });
      teamId = athleteProfile?.teamId ?? undefined;
    }

    return this.prisma.video.create({
      data: {
        ...videoData,
        uploadedById: userId,
        teamId,
        tags: tagIds?.length
          ? { create: (tagIds as string[]).map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        session: true,
        tags: { include: { tag: true } },
      },
    });
  }

  async findAll(filters: VideoQueryFilters = {}) {
    const { type, sessionId, teamId, tagKey, location, q, dateFrom, dateTo, windMin, windMax, mine, userId } =
      filters;

    return this.prisma.video.findMany({
      where: {
        deletedAt: null,
        ...(type && { type: type as any }),
        ...(sessionId && { sessionId }),
        ...(teamId && { teamId }),
        ...(mine && userId && { uploadedById: userId }),
        ...(location && { location: { contains: location, mode: 'insensitive' } }),
        ...(tagKey && { tags: { some: { tag: { key: tagKey } } } }),
        ...((windMin !== undefined || windMax !== undefined) && {
          windSpeed: {
            ...(windMin !== undefined && { gte: windMin }),
            ...(windMax !== undefined && { lte: windMax }),
          },
        }),
        ...((dateFrom || dateTo) && {
          recordedAt: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }),
        ...(q && {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { feedback: { contains: q, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        session: true,
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.video.findUnique({
      where: { id },
      include: { uploadedBy: true, session: true, tags: { include: { tag: true } } },
    });
  }

  async update(id: string, data: any) {
    const { tagIds, ...videoData } = data;
    if (videoData.recordedAt) {
      videoData.recordedAt = new Date(videoData.recordedAt);
    }
    return this.prisma.video.update({
      where: { id },
      data: {
        ...videoData,
        ...(tagIds && {
          tags: {
            deleteMany: {},
            create: (tagIds as string[]).map((tagId) => ({ tagId })),
          },
        }),
      },
      include: { tags: { include: { tag: true } } },
    });
  }

  async remove(id: string) {
    return this.prisma.video.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /** Distribución de videos/informes por sección (indicador de % de carga por área). */
  async getLoadDistribution({ userId, teamId }: { userId: string; teamId?: string }) {
    const where = {
      deletedAt: null,
      ...(teamId ? { teamId } : { uploadedById: userId }),
    };

    const total = await this.prisma.video.count({ where });
    if (total === 0) {
      return { total: 0, sections: [] };
    }

    const sections = await this.prisma.tag.findMany({
      where: { level: TagLevel.SECTION },
      orderBy: { order: 'asc' },
    });

    const sectionCounts = await Promise.all(
      sections.map(async (section) => {
        const count = await this.prisma.video.count({
          where: {
            ...where,
            tags: {
              some: { tag: { OR: [{ id: section.id }, { parentId: section.id }] } },
            },
          },
        });
        return {
          tagId: section.id,
          key: section.key,
          label: section.label,
          count,
          percentage: Math.round((count / total) * 1000) / 10,
        };
      }),
    );

    return { total, sections: sectionCounts };
  }
}

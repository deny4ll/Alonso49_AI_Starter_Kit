import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    return this.prisma.video.create({
      data: {
        ...data,
        uploadedById: userId,
      },
    });
  }

  async findAll(filters?: any) {
    return this.prisma.video.findMany({
      where: { deletedAt: null, ...filters },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        session: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.video.findUnique({
      where: { id },
      include: { uploadedBy: true, session: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.video.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.video.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

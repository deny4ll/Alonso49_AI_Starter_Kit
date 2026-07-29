import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

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

    return { sessions, videos };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.team.create({ data });
  }

  async findAll() {
    return this.prisma.team.findMany({
      where: { deletedAt: null },
      include: {
        coach: true,
        academy: true,
        members: { include: { user: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.team.findUnique({
      where: { id },
      include: {
        coach: true,
        academy: true,
        members: { include: { user: true } },
        sessions: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.team.update({ where: { id }, data });
  }

  async addMember(teamId: string, userId: string) {
    return this.prisma.teamMember.create({
      data: { teamId, userId },
    });
  }
}

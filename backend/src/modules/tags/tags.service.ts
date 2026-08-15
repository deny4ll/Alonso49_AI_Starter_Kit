import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TagLevel } from '@prisma/client';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  /** Taxonomía completa de la Metodología SAILVEX: secciones con sus subsecciones. */
  async findAll() {
    return this.prisma.tag.findMany({
      where: { level: TagLevel.SECTION },
      orderBy: { order: 'asc' },
      include: {
        children: { orderBy: { order: 'asc' } },
      },
    });
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateTrainerDto } from './dto';

@Injectable()
export class TrainersService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.trainer.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateAccess(id: string, dto: UpdateTrainerDto, currentTrainerId: string) {
    const trainer = await this.prisma.trainer.findUnique({ where: { id } });
    if (!trainer) {
      throw new NotFoundException('Entrenador no encontrado');
    }

    // Un ADMIN no puede quitarse a sí mismo el acceso ni el rol de ADMIN,
    // para evitar que el último admin se bloquee a sí mismo sin querer.
    if (id === currentTrainerId) {
      if (dto.isActive === false) {
        throw new BadRequestException('No puedes quitarte el acceso a ti mismo');
      }
      if (dto.role && dto.role !== 'ADMIN') {
        throw new BadRequestException('No puedes quitarte el rol de ADMIN a ti mismo');
      }
    }

    return this.prisma.trainer.update({
      where: { id },
      data: {
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }
}

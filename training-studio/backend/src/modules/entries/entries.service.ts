import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntryOrigin, ReviewStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { CreateEntryDto } from './dto/create-entry.dto';

const LIST_INCLUDE = {
  document: true,
  createdBy: { select: { firstName: true, lastName: true } },
  reviewedBy: { select: { firstName: true, lastName: true } },
  _count: { select: { chunks: true } },
};

// Cola de revisión unificada: cubre los tres orígenes (UPLOAD, MANUAL,
// CORRECTION) porque todos terminan en la misma tabla TrainingEntry.
@Injectable()
export class EntriesService {
  constructor(
    private prisma: PrismaService,
    private ingestion: IngestionService,
  ) {}

  async createManual(dto: CreateEntryDto, trainerId: string) {
    return this.ingestion.ingest({
      origin: 'MANUAL' as EntryOrigin,
      title: dto.title,
      category: dto.category,
      content: dto.content,
      status: (dto.submit ? 'PENDING_REVIEW' : 'DRAFT') as ReviewStatus,
      createdById: trainerId,
    });
  }

  async list(filters: { status?: ReviewStatus; origin?: EntryOrigin }) {
    return this.prisma.trainingEntry.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.origin ? { origin: filters.origin } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: LIST_INCLUDE,
    });
  }

  private async getEntryOrThrow(id: string) {
    const entry = await this.prisma.trainingEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Entrada no encontrada');
    }
    return entry;
  }

  async approve(id: string, trainerId: string) {
    const entry = await this.getEntryOrThrow(id);

    if (entry.processingStatus !== 'READY') {
      throw new BadRequestException('La entrada aún se está procesando o falló, no se puede aprobar');
    }
    if (entry.piiStatus === 'FLAGGED') {
      throw new BadRequestException(
        'Esta entrada tiene información sensible detectada: debe confirmarse antes de aprobar',
      );
    }

    return this.prisma.trainingEntry.update({
      where: { id },
      data: { status: 'APPROVED', reviewedById: trainerId, reviewedAt: new Date() },
      include: LIST_INCLUDE,
    });
  }

  async reject(id: string, trainerId: string) {
    await this.getEntryOrThrow(id);

    return this.prisma.trainingEntry.update({
      where: { id },
      data: { status: 'REJECTED', reviewedById: trainerId, reviewedAt: new Date() },
      include: LIST_INCLUDE,
    });
  }

  // Panel de solo lectura para /export: nunca dispara el script de sync,
  // solo informa cuántas entradas aprobadas están listas para sincronizarse
  // manualmente vía `npm run sync:platform`.
  async exportStatus() {
    const [approvedUnsynced, totalSynced, lastSynced] = await Promise.all([
      this.prisma.trainingEntry.count({
        where: { status: 'APPROVED', syncedAt: null, piiStatus: { not: 'FLAGGED' } },
      }),
      this.prisma.trainingEntry.count({ where: { NOT: { syncedAt: null } } }),
      this.prisma.trainingEntry.findFirst({
        where: { NOT: { syncedAt: null } },
        orderBy: { syncedAt: 'desc' },
        select: { syncedAt: true },
      }),
    ]);

    return {
      approvedReadyToSync: approvedUnsynced,
      totalAlreadySynced: totalSynced,
      lastSyncedAt: lastSynced?.syncedAt ?? null,
    };
  }

  async confirmPii(id: string, trainerId: string) {
    const entry = await this.getEntryOrThrow(id);

    if (entry.piiStatus !== 'FLAGGED') {
      throw new BadRequestException('Esta entrada no tiene información sensible pendiente de confirmar');
    }

    return this.prisma.trainingEntry.update({
      where: { id },
      data: {
        piiStatus: 'CONFIRMED',
        piiConfirmedAt: new Date(),
        reviewedById: trainerId,
      },
      include: LIST_INCLUDE,
    });
  }
}

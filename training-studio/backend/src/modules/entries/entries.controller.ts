import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EntryOrigin, ReviewStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { EntriesService } from './entries.service';
import { CreateEntryDto } from './dto/create-entry.dto';

@ApiTags('entries')
@Controller('entries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EntriesController {
  constructor(private entriesService: EntriesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una entrada manual ("Guardar Borrador" o "Enviar a Revisión")' })
  create(@Body() dto: CreateEntryDto, @GetUser('id') trainerId: string) {
    return this.entriesService.createManual(dto, trainerId);
  }

  @Get()
  @ApiOperation({ summary: 'Cola de revisión unificada (documentos, manual y correcciones)' })
  list(@Query('status') status?: ReviewStatus, @Query('origin') origin?: EntryOrigin) {
    return this.entriesService.list({ status, origin });
  }

  @Get('export-status')
  @ApiOperation({ summary: 'Estado de sincronización hacia la plataforma (solo lectura)' })
  exportStatus() {
    return this.entriesService.exportStatus();
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Aprobar una entrada' })
  approve(@Param('id') id: string, @GetUser('id') trainerId: string) {
    return this.entriesService.approve(id, trainerId);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Rechazar una entrada' })
  reject(@Param('id') id: string, @GetUser('id') trainerId: string) {
    return this.entriesService.reject(id, trainerId);
  }

  @Patch(':id/confirm-pii')
  @ApiOperation({ summary: 'Confirmar que la información sensible detectada fue revisada' })
  confirmPii(@Param('id') id: string, @GetUser('id') trainerId: string) {
    return this.entriesService.confirmPii(id, trainerId);
  }
}

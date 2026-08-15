import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TrackersService } from './trackers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('trackers')
@Controller('trackers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrackersController {
  constructor(private trackersService: TrackersService) {}

  @Post()
  @ApiOperation({ summary: 'Subir tracker GPS/sensor (puntos ya parseados desde GPX/CSV en el cliente)' })
  create(@Body() data: any, @GetUser('id') userId: string) {
    return this.trackersService.create(data, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar trackers GPS (propios, de una sesión o de un equipo)' })
  findAll(
    @GetUser('id') userId: string,
    @Query('sessionId') sessionId?: string,
    @Query('teamId') teamId?: string,
  ) {
    return this.trackersService.findAll({ sessionId, teamId, userId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tracker GPS por ID (puntos + resumen para el mapa)' })
  findOne(@Param('id') id: string) {
    return this.trackersService.findOne(id);
  }
}

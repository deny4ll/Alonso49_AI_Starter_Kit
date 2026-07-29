import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva sesión' })
  create(@Body() createDto: any, @GetUser('id') userId: string) {
    return this.sessionsService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las sesiones' })
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sesión por ID' })
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar sesión' })
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.sessionsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar sesión' })
  remove(@Param('id') id: string) {
    return this.sessionsService.remove(id);
  }
}

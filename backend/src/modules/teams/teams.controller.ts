import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('teams')
@Controller('teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear equipo' })
  create(@Body() createDto: any) {
    return this.teamsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los equipos' })
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener equipo por ID' })
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar equipo' })
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.teamsService.update(id, updateDto);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Agregar miembro al equipo' })
  addMember(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.teamsService.addMember(id, body.userId);
  }
}

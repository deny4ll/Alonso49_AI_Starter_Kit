import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Obtener análisis de sesión' })
  getSessionAnalytics(@Param('id') id: string) {
    return this.analyticsService.getSessionAnalytics(id);
  }

  @Post('sessions/:id')
  @ApiOperation({ summary: 'Crear análisis de sesión' })
  createSessionAnalytics(@Param('id') id: string, @Body() data: any) {
    return this.analyticsService.createSessionAnalytics(id, data);
  }

  @Get('users/me/stats')
  @ApiOperation({
    summary:
      'Estadísticas del usuario: sesiones, videos, días de agua, promedio mensual, días de descanso, horas de AI Coach',
  })
  getUserStats(@GetUser('id') userId: string) {
    return this.analyticsService.getUserStats(userId);
  }

  @Get('teams/:teamId/benchmark')
  @ApiOperation({ summary: 'Obtener benchmark objetivo del equipo (equipo target AI)' })
  getBenchmark(@Param('teamId') teamId: string) {
    return this.analyticsService.getBenchmark(teamId);
  }

  @Post('teams/:teamId/benchmark')
  @ApiOperation({ summary: 'Crear o actualizar el benchmark objetivo del equipo' })
  upsertBenchmark(@Param('teamId') teamId: string, @Body() data: any) {
    return this.analyticsService.upsertBenchmark(teamId, data);
  }

  @Get('teams/:teamId/comparison')
  @ApiOperation({ summary: 'Comparar rendimiento real del equipo contra el benchmark' })
  getTeamComparison(@Param('teamId') teamId: string) {
    return this.analyticsService.getTeamComparison(teamId);
  }

  @Get('teams/:teamId/big-picture')
  @ApiOperation({ summary: 'Obtener resumen cualitativo (Big Picture) del progreso del equipo' })
  getBigPicture(@Param('teamId') teamId: string) {
    return this.analyticsService.getBigPicture(teamId);
  }

  @Post('teams/:teamId/big-picture')
  @ApiOperation({ summary: 'Actualizar el resumen cualitativo (Big Picture) del equipo' })
  upsertBigPicture(
    @Param('teamId') teamId: string,
    @Body() data: { content: string },
    @GetUser('id') userId: string,
  ) {
    return this.analyticsService.upsertBigPicture(teamId, data.content, userId);
  }
}

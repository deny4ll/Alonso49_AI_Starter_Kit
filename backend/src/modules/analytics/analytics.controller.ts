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
  @ApiOperation({ summary: 'Obtener estadísticas del usuario' })
  getUserStats(@GetUser('id') userId: string) {
    return this.analyticsService.getUserStats(userId);
  }
}

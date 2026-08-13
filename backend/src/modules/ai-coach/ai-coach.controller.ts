import { Controller, Post, Body, UseGuards, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiCoachService } from './ai-coach.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ChatDto, AnalyzeVideoDto, AnalyzeSessionDto, TrainingPlanDto } from './dto/chat.dto';

@ApiTags('ai-coach')
@Controller('ai-coach')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiCoachController {
  constructor(private aiCoachService: AiCoachService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat con el AI Coach' })
  async chat(@GetUser('id') userId: string, @Body() dto: ChatDto) {
    return this.aiCoachService.chat(userId, dto.message, {
      userId,
      sessionId: dto.sessionId,
      videoId: dto.videoId,
      ...dto.context,
    });
  }

  @Post('analyze-video')
  @ApiOperation({ summary: 'Analizar video con AI Coach' })
  async analyzeVideo(@GetUser('id') userId: string, @Body() dto: AnalyzeVideoDto) {
    return this.aiCoachService.analyzeVideo(userId, dto.videoId, dto.specificQuestion);
  }

  @Post('analyze-session')
  @ApiOperation({ summary: 'Analizar sesión con AI Coach' })
  async analyzeSession(@GetUser('id') userId: string, @Body() dto: AnalyzeSessionDto) {
    return this.aiCoachService.analyzeSession(userId, dto.sessionId);
  }

  @Post('training-plan')
  @ApiOperation({ summary: 'Generar plan de entrenamiento personalizado' })
  async getTrainingPlan(@GetUser('id') userId: string, @Body() dto: TrainingPlanDto) {
    return this.aiCoachService.getTrainingPlan(userId, dto.goals);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscador con filtros: viento, fecha, área/maniobra (tagKey), sitio, texto' })
  async search(@GetUser('id') userId: string, @Query() query: any) {
    const { q, windMin, windMax, dateFrom, dateTo, location, tagKey } = query;
    return this.aiCoachService.search(userId, {
      q,
      dateFrom,
      dateTo,
      location,
      tagKey,
      windMin: windMin !== undefined ? Number(windMin) : undefined,
      windMax: windMax !== undefined ? Number(windMax) : undefined,
    });
  }

  @Get('history')
  @ApiOperation({ summary: 'Obtener historial de conversaciones con el coach' })
  async getHistory(@GetUser('id') userId: string) {
    return {
      message: 'Historial de conversaciones (próximamente)',
      userId,
    };
  }
}

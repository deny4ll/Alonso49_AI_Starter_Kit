import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024; // 200MB, límite razonable para un MVP

@ApiTags('videos')
@Controller('videos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear video o informe (video referenciado por URL, o informe sin archivo)' })
  create(@Body() createDto: any, @GetUser('id') userId: string) {
    return this.videosService.create(createDto, userId);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Subir un archivo de video real y crear el registro' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_VIDEO_SIZE_BYTES } }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Record<string, string>,
    @GetUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Falta el archivo de video');
    }
    return this.videosService.createFromUpload(file, body, userId);
  }

  @Get()
  @ApiOperation({
    summary:
      'Buscar videos e informes (filtros: type, sessionId, teamId, tagKey, location, q, dateFrom, dateTo, windMin, windMax, mine)',
  })
  findAll(@GetUser('id') userId: string, @Query() query: any) {
    const { type, sessionId, teamId, tagKey, location, q, dateFrom, dateTo, windMin, windMax, mine } = query;
    return this.videosService.findAll({
      type,
      sessionId,
      teamId,
      tagKey,
      location,
      q,
      dateFrom,
      dateTo,
      windMin: windMin !== undefined ? Number(windMin) : undefined,
      windMax: windMax !== undefined ? Number(windMax) : undefined,
      mine: mine === 'true' || mine === true,
      userId,
    });
  }

  @Get('load-distribution')
  @ApiOperation({ summary: 'Distribución (% de carga) de videos/informes por área de trabajo' })
  getLoadDistribution(@GetUser('id') userId: string, @Query('teamId') teamId?: string) {
    return this.videosService.getLoadDistribution({ userId, teamId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener video por ID' })
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar video (incluye feedback y tagIds)' })
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.videosService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar video' })
  remove(@Param('id') id: string) {
    return this.videosService.remove(id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('videos')
@Controller('videos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Post()
  @ApiOperation({ summary: 'Subir nuevo video' })
  create(@Body() createDto: any, @GetUser('id') userId: string) {
    return this.videosService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los videos' })
  findAll() {
    return this.videosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener video por ID' })
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar video' })
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.videosService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar video' })
  remove(@Param('id') id: string) {
    return this.videosService.remove(id);
  }
}

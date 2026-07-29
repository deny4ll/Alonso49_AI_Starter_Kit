import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('courses')
@Controller('courses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear curso' })
  create(@Body() createDto: any) {
    return this.coursesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener cursos publicados' })
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener curso por ID' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post(':id/enroll')
  @ApiOperation({ summary: 'Inscribirse en curso' })
  enroll(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.coursesService.enroll(id, userId);
  }
}

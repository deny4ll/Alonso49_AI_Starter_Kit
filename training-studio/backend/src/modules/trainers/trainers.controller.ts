import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TrainerRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { TrainersService } from './trainers.service';
import { UpdateTrainerDto } from './dto';

// Gestión de acceso al Training Studio: solo un ADMIN puede ver quién tiene
// cuenta y activar/desactivar acceso o cambiar roles.
@ApiTags('trainers')
@Controller('trainers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TrainerRole.ADMIN)
@ApiBearerAuth()
export class TrainersController {
  constructor(private trainersService: TrainersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar entrenadores y su acceso (solo ADMIN)' })
  list() {
    return this.trainersService.list();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cambiar rol o activar/desactivar acceso de un entrenador (solo ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateTrainerDto, @GetUser('id') currentTrainerId: string) {
    return this.trainersService.updateAccess(id, dto, currentTrainerId);
  }
}

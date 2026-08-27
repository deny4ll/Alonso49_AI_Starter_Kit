import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TrainerRole } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { GetUser } from './decorators/get-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión como entrenador' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Solo un ADMIN ya autenticado puede dar de alta nuevos entrenadores
  // (invitación), no hay auto-registro público.
  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TrainerRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dar de alta un nuevo entrenador (solo ADMIN)' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener entrenador actual' })
  getMe(@GetUser() trainer: any) {
    return trainer;
  }
}

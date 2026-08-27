import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const trainer = await this.prisma.trainer.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role || 'TRAINER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    const accessToken = await this.generateToken(trainer.id, trainer.email, trainer.role);

    return { user: trainer, accessToken };
  }

  async login(dto: LoginDto) {
    const trainer = await this.prisma.trainer.findUnique({ where: { email: dto.email } });

    if (!trainer) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, trainer.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!trainer.isActive) {
      throw new UnauthorizedException('Cuenta de entrenador inactiva');
    }

    const accessToken = await this.generateToken(trainer.id, trainer.email, trainer.role);

    return {
      user: {
        id: trainer.id,
        email: trainer.email,
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        role: trainer.role,
      },
      accessToken,
    };
  }

  private async generateToken(trainerId: string, email: string, role: string) {
    return this.jwtService.signAsync({ sub: trainerId, email, role });
  }
}

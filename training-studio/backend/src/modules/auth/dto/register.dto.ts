import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { TrainerRole } from '@prisma/client';

// El alta de entrenadores es solo por invitación (un ADMIN ya autenticado
// crea la cuenta); no hay auto-registro público en este módulo.
export class RegisterDto {
  @ApiProperty({ example: 'entrenador@alonso49.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Ana' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: TrainerRole, example: 'TRAINER', required: false })
  @IsOptional()
  @IsEnum(TrainerRole)
  role?: TrainerRole;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { TrainerRole } from '@prisma/client';

export class UpdateTrainerDto {
  @ApiProperty({ enum: TrainerRole, required: false })
  @IsOptional()
  @IsEnum(TrainerRole)
  role?: TrainerRole;

  @ApiProperty({ required: false, description: 'Da o quita acceso al Training Studio' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

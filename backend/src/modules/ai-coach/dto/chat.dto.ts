import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class ChatDto {
  @ApiProperty({ 
    example: '¿Cómo puedo mejorar mi técnica de tacking en condiciones de viento fuerte?' 
  })
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  videoId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  context?: any;
}

export class AnalyzeVideoDto {
  @ApiProperty()
  @IsString()
  videoId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specificQuestion?: string;
}

export class AnalyzeSessionDto {
  @ApiProperty()
  @IsString()
  sessionId: string;
}

export class TrainingPlanDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  goals?: string;
}

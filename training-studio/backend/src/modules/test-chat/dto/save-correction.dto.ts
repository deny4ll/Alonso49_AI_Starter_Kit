import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { KnowledgeCategory } from '@prisma/client';

export class SaveCorrectionDto {
  @ApiProperty({ example: 'Regulación del cunningham con viento fuerte' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ enum: KnowledgeCategory })
  @IsEnum(KnowledgeCategory)
  category: KnowledgeCategory;

  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty()
  @IsString()
  aiAnswer: string;

  // Requerido solo cuando action = 'CORRECT'
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  correctedAnswer?: string;

  @ApiProperty({ enum: ['APPROVE', 'CORRECT'], example: 'APPROVE' })
  @IsIn(['APPROVE', 'CORRECT'])
  action: 'APPROVE' | 'CORRECT';
}

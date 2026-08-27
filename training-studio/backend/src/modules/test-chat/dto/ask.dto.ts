import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { KnowledgeCategory } from '@prisma/client';

export class AskDto {
  @ApiProperty({ example: '¿Cómo debo regular el cunningham con 18 nudos?' })
  @IsString()
  @MinLength(3)
  question: string;

  @ApiProperty({ enum: KnowledgeCategory, required: false })
  @IsOptional()
  @IsEnum(KnowledgeCategory)
  category?: KnowledgeCategory;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { KnowledgeCategory } from '@prisma/client';

export class UploadDocumentDto {
  @ApiProperty({ example: 'Manual de reglaje 49er' })
  @IsString()
  title: string;

  @ApiProperty({ enum: KnowledgeCategory })
  @IsEnum(KnowledgeCategory)
  category: KnowledgeCategory;
}

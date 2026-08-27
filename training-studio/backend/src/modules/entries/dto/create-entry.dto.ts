import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsString, MinLength } from 'class-validator';
import { KnowledgeCategory } from '@prisma/client';

export class CreateEntryDto {
  @ApiProperty({ example: 'Cómo ajustar el cunningham con viento fuerte' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ enum: KnowledgeCategory })
  @IsEnum(KnowledgeCategory)
  category: KnowledgeCategory;

  @ApiProperty({ example: 'Con más de 15 nudos, tensar el cunningham para aplanar la vela...' })
  @IsString()
  @MinLength(10)
  content: string;

  // true = botón "Enviar a Revisión", false = botón "Guardar Borrador"
  @ApiProperty({ example: true })
  @IsBoolean()
  submit: boolean;
}

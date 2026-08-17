import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { KnowledgeBaseService } from './knowledge-base.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

@ApiTags('knowledge-base')
@Controller('knowledge-base')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COACH)
@ApiBearerAuth()
export class KnowledgeBaseController {
  constructor(private knowledgeBaseService: KnowledgeBaseService) {}

  @Get('documents')
  @ApiOperation({ summary: 'Listar documentos de la Knowledge Base' })
  listDocuments() {
    return this.knowledgeBaseService.listDocuments();
  }

  @Post('documents')
  @ApiOperation({ summary: 'Subir un documento (PDF/DOCX) a la Knowledge Base' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENT_SIZE_BYTES } }))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Record<string, string>,
    @GetUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Falta el archivo');
    }
    return this.knowledgeBaseService.uploadDocument(file, body, userId);
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Eliminar un documento de la Knowledge Base' })
  deleteDocument(@Param('id') id: string) {
    return this.knowledgeBaseService.deleteDocument(id);
  }
}

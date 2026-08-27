import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { StorageService } from '../../storage/storage.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { ALLOWED_DOCUMENT_MIME_TYPES, extractText } from '../ingestion/document-parser.util';
import { UploadDocumentDto } from './dto/upload-document.dto';

const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(
    private storage: StorageService,
    private ingestion: IngestionService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Subir un documento (PDF/DOCX) para entrenar al AI Coach' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENT_SIZE_BYTES } }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @GetUser('id') trainerId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Falta el archivo');
    }
    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Solo se admiten archivos PDF o Word (.docx)');
    }

    const sourceUrl = await this.storage.uploadFile(file.buffer, file.originalname, file.mimetype);
    const text = await extractText(file.buffer, file.mimetype);

    if (!text.trim()) {
      throw new BadRequestException('No se pudo extraer texto del documento');
    }

    return this.ingestion.ingest({
      origin: 'UPLOAD',
      title: dto.title,
      category: dto.category,
      content: text,
      status: 'PENDING_REVIEW',
      createdById: trainerId,
      document: {
        sourceFileName: file.originalname,
        sourceUrl,
        mimeType: file.mimetype,
      },
    });
  }
}

import { randomUUID } from 'crypto';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KnowledgeCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { ALLOWED_DOCUMENT_MIME_TYPES, extractText } from './document-parser.util';
import { chunkText } from './chunking.util';
import { getEmbedding, toVectorLiteral } from './embeddings.util';

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);
  private readonly openaiApiKey?: string;

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private config: ConfigService,
  ) {
    this.openaiApiKey = this.config.get('OPENAI_API_KEY');
  }

  async uploadDocument(file: Express.Multer.File, body: Record<string, string>, userId: string) {
    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Solo se admiten archivos PDF o Word (.docx)');
    }
    if (!body.title) {
      throw new BadRequestException('Falta el título del documento');
    }
    if (!body.category || !(Object.values(KnowledgeCategory) as string[]).includes(body.category)) {
      throw new BadRequestException('Categoría inválida');
    }
    if (!this.openaiApiKey) {
      throw new InternalServerErrorException('OPENAI_API_KEY no está configurada');
    }

    const sourceUrl = await this.storage.uploadFile(file.buffer, file.originalname, file.mimetype);

    const document = await this.prisma.knowledgeDocument.create({
      data: {
        title: body.title,
        category: body.category as KnowledgeCategory,
        sourceFileName: file.originalname,
        sourceUrl,
        status: 'PROCESSING',
        uploadedById: userId,
      },
    });

    try {
      const text = await extractText(file.buffer, file.mimetype);
      const chunks = chunkText(text);

      if (chunks.length === 0) {
        throw new Error('No se pudo extraer texto del documento');
      }

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await getEmbedding(this.openaiApiKey, chunks[i]);
        const vectorLiteral = toVectorLiteral(embedding);

        await this.prisma.$executeRaw`
          INSERT INTO knowledge_chunks (id, "documentId", "chunkIndex", content, embedding, "createdAt")
          VALUES (${randomUUID()}, ${document.id}, ${i}, ${chunks[i]}, ${vectorLiteral}::vector, now())
        `;
      }

      return this.prisma.knowledgeDocument.update({
        where: { id: document.id },
        data: { status: 'READY' },
        include: { _count: { select: { chunks: true } } },
      });
    } catch (error) {
      this.logger.error(`Error procesando documento ${document.id}: ${error.message}`);
      return this.prisma.knowledgeDocument.update({
        where: { id: document.id },
        data: { status: 'FAILED', errorMessage: String(error.message).slice(0, 500) },
      });
    }
  }

  async listDocuments() {
    return this.prisma.knowledgeDocument.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: { select: { firstName: true, lastName: true } },
        _count: { select: { chunks: true } },
      },
    });
  }

  async deleteDocument(id: string) {
    const document = await this.prisma.knowledgeDocument.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }
    await this.prisma.knowledgeDocument.delete({ where: { id } });
    return { success: true };
  }
}

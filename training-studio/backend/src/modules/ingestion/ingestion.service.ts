import { randomUUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntryOrigin, KnowledgeCategory, ReviewStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { chunkText } from './chunking.util';
import { getEmbedding, toVectorLiteral } from './embeddings.util';
import { scanForPii } from '../pii/pii.util';

export interface IngestParams {
  origin: EntryOrigin;
  title: string;
  category: KnowledgeCategory;
  content: string;
  status: ReviewStatus;
  createdById: string;
  question?: string;
  aiAnswer?: string;
  document?: { sourceFileName: string; sourceUrl: string; mimeType: string };
}

// Pipeline único usado por los tres métodos de acción (subida de
// documentos, escritura manual y corrección de respuestas del chat de
// prueba): escaneo de PII -> chunking -> embeddings -> persistencia. Ningún
// método de acción se salta o bifurca este pipeline.
@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly openaiApiKey?: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.openaiApiKey = this.config.get('OPENAI_API_KEY');
  }

  async ingest(params: IngestParams) {
    const { origin, title, category, content, status, createdById, question, aiAnswer, document } = params;

    const pii = scanForPii([content, aiAnswer].filter(Boolean).join('\n\n'));

    const entry = await this.prisma.trainingEntry.create({
      data: {
        origin,
        title,
        category,
        content,
        question,
        aiAnswer,
        status,
        processingStatus: 'PROCESSING',
        piiStatus: pii.status === 'FLAGGED' ? 'FLAGGED' : 'CLEAN',
        piiFindings: pii.findings.length ? (pii.findings as any) : undefined,
        createdById,
        ...(document ? { document: { create: document } } : {}),
      },
    });

    try {
      const chunks = chunkText(content);

      for (let i = 0; i < chunks.length; i++) {
        if (this.openaiApiKey) {
          const embedding = await getEmbedding(this.openaiApiKey, chunks[i]);
          const vectorLiteral = toVectorLiteral(embedding);
          await this.prisma.$executeRaw`
            INSERT INTO training_chunks (id, "entryId", "chunkIndex", content, embedding, "createdAt")
            VALUES (${randomUUID()}, ${entry.id}, ${i}, ${chunks[i]}, ${vectorLiteral}::vector, now())
          `;
        } else {
          // Sin OPENAI_API_KEY: se guarda el chunk sin embedding. No será
          // recuperable por búsqueda semántica en /test-chat, pero sigue
          // siendo revisable y exportable como texto.
          await this.prisma.trainingChunk.create({
            data: { entryId: entry.id, chunkIndex: i, content: chunks[i] },
          });
        }
      }

      return this.prisma.trainingEntry.update({
        where: { id: entry.id },
        data: { processingStatus: 'READY' },
        include: { document: true, _count: { select: { chunks: true } } },
      });
    } catch (error) {
      this.logger.error(`Error procesando entrada ${entry.id}: ${error.message}`);
      return this.prisma.trainingEntry.update({
        where: { id: entry.id },
        data: { processingStatus: 'FAILED', errorMessage: String(error.message).slice(0, 500) },
      });
    }
  }
}

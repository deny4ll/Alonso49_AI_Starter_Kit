import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { getEmbedding, toVectorLiteral } from '../ingestion/embeddings.util';
import { scanForPii } from '../pii/pii.util';
import { TEST_CHAT_SYSTEM_PROMPT } from './test-chat-prompt';
import { AskDto } from './dto/ask.dto';
import { SaveCorrectionDto } from './dto/save-correction.dto';

interface RetrievedChunk {
  title: string;
  category: string;
  content: string;
  similarity: number;
}

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

@Injectable()
export class TestChatService {
  private readonly openaiApiKey?: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private ingestion: IngestionService,
  ) {
    this.openaiApiKey = this.config.get('OPENAI_API_KEY');
  }

  async ask(dto: AskDto) {
    if (!this.openaiApiKey) {
      return {
        answer: 'OPENAI_API_KEY no está configurada: no se puede generar una respuesta de prueba.',
        sources: [],
        piiFlagged: false,
      };
    }

    const embedding = await getEmbedding(this.openaiApiKey, dto.question);
    const vectorLiteral = toVectorLiteral(embedding);

    const rows = await this.prisma.$queryRaw<RetrievedChunk[]>`
      SELECT te.title, te.category, tc.content,
             1 - (tc.embedding <=> ${vectorLiteral}::vector) AS similarity
      FROM training_chunks tc
      JOIN training_entries te ON te.id = tc."entryId"
      WHERE te.status = 'APPROVED' AND tc.embedding IS NOT NULL
        ${dto.category ? Prisma.sql`AND te.category = ${dto.category}::"KnowledgeCategory"` : Prisma.empty}
      ORDER BY tc.embedding <=> ${vectorLiteral}::vector
      LIMIT 5
    `;

    const context = rows.length
      ? rows.map((r) => `# ${r.title}\n${r.content}`).join('\n\n---\n\n')
      : 'No hay contenido aprobado relevante todavía.';

    const messages = [
      { role: 'system', content: TEST_CHAT_SYSTEM_PROMPT },
      { role: 'system', content: `# CONOCIMIENTO APROBADO DISPONIBLE\n\n${context}` },
      { role: 'user', content: dto.question },
    ];

    const rawAnswer = await this.callOpenAI(messages);
    const piiScan = scanForPii(rawAnswer);

    return {
      answer: piiScan.status === 'FLAGGED' ? piiScan.redactedContent : rawAnswer,
      piiFlagged: piiScan.status === 'FLAGGED',
      sources: rows.map((r) => ({ title: r.title, category: r.category, similarity: Number(r.similarity.toFixed(4)) })),
    };
  }

  async saveCorrection(dto: SaveCorrectionDto, trainerId: string) {
    if (dto.action === 'CORRECT' && !dto.correctedAnswer?.trim()) {
      throw new BadRequestException('Falta el texto corregido');
    }

    const finalContent = dto.action === 'CORRECT' ? dto.correctedAnswer! : dto.aiAnswer;

    return this.ingestion.ingest({
      origin: 'CORRECTION',
      title: dto.title,
      category: dto.category,
      content: finalContent,
      question: dto.question,
      aiAnswer: dto.aiAnswer,
      status: 'PENDING_REVIEW',
      createdById: trainerId,
    });
  }

  private async callOpenAI(messages: { role: string; content: string }[]): Promise<string> {
    const response = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

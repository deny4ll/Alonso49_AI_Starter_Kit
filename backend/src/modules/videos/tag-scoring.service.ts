import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TagLevel } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface ScoredTag {
  score: number;
  note: string;
}

/**
 * Le pide al AI Coach una nota 1-10 + comentario corto por cada subárea
 * etiquetada en una entrada (video/informe), a partir del texto que ya
 * escribió el atleta (título, descripción, feedback). No analiza video/imagen
 * — mismo alcance que analyzeVideo/analyzeSession del AI Coach, que tampoco
 * miran el archivo.
 *
 * Best-effort y no bloqueante para quien sube el contenido: si no hay texto,
 * no hay API key, o falla la llamada, la entrada queda sin puntaje (VideoTag
 * .score = null) en vez de romper la subida. Usado por Progreso ("Nivel").
 */
@Injectable()
export class TagScoringService {
  private readonly logger = new Logger(TagScoringService.name);
  private openaiApiKey: string;
  private openaiApiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.openaiApiKey = this.config.get('OPENAI_API_KEY');
  }

  async scoreEntryTags(videoId: string): Promise<void> {
    try {
      const video = await this.prisma.video.findUnique({
        where: { id: videoId },
        include: { tags: { include: { tag: true } } },
      });
      if (!video) return;

      const subsectionTags = video.tags.filter((vt) => vt.tag.level === TagLevel.SUBSECTION);
      if (subsectionTags.length === 0) return;

      const text = [video.title, video.description, video.feedback].filter(Boolean).join('\n');
      if (!text.trim() || !this.openaiApiKey) return;

      const scores = await this.requestScores(
        text,
        subsectionTags.map((vt) => ({ id: vt.tagId, label: vt.tag.label })),
      );

      await Promise.all(
        subsectionTags.map((vt) => {
          const scored = scores[vt.tagId];
          if (!scored) return null;
          return this.prisma.videoTag.update({
            where: { videoId_tagId: { videoId: vt.videoId, tagId: vt.tagId } },
            data: { score: scored.score, note: scored.note },
          });
        }),
      );
    } catch (error) {
      this.logger.warn(`No se pudo puntuar el video/informe ${videoId}: ${error.message}`);
    }
  }

  private async requestScores(
    text: string,
    subareas: { id: string; label: string }[],
  ): Promise<Record<string, ScoredTag>> {
    const prompt = `Sos un entrenador de vela de alto rendimiento que sigue la Metodología SAILVEX. Un atleta subió este informe/feedback de una sesión de entrenamiento:

"""
${text}
"""

Evaluá específicamente estas subáreas que el atleta marcó como trabajadas en esta entrada, cada una con una nota de 1 a 10 (1 = muy débil, 10 = dominado a nivel elite), basándote únicamente en lo que describió. Si el texto no da detalle específico de una subárea puntual, igual asigná el número que mejor represente lo descripto en general para esa sesión — no dejes ninguna subárea sin evaluar.

Respondé SOLO un JSON con esta forma exacta, sin texto adicional:
{"scores": [{"id": "<id de la subárea>", "score": <entero 1-10>, "note": "<una frase breve en español explicando el porqué del puntaje>"}]}

Subáreas a evaluar:
${subareas.map((s) => `- id: ${s.id} — ${s.label}`).join('\n')}`;

    const response = await fetch(this.openaiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    const result: Record<string, ScoredTag> = {};

    for (const item of parsed.scores || []) {
      if (!item?.id) continue;
      const score = Math.round(Number(item.score));
      if (!Number.isFinite(score)) continue;
      result[item.id] = {
        score: Math.max(1, Math.min(10, score)),
        note: String(item.note || '').slice(0, 300),
      };
    }

    return result;
  }
}

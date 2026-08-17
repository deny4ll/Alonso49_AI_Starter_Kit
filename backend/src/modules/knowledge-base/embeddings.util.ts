// Helper de embeddings compartido por la ingesta de documentos (knowledge-base.service.ts)
// y la búsqueda semántica del AI Coach (ai-coach/tools/tool-implementations.ts). Usa fetch
// directo a la API de OpenAI, igual que ai-coach.service.ts, en vez del SDK `openai`.
const OPENAI_EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings';
const EMBEDDING_MODEL = 'text-embedding-3-small';

export async function getEmbedding(apiKey: string, text: string): Promise<number[]> {
  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`OpenAI embeddings error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// pgvector espera el literal como texto "[0.1,0.2,...]" al castear con ::vector.
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

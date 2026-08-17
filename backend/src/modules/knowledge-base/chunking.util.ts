// Trocea texto largo en fragmentos aptos para embeddings, respetando párrafos cuando
// es posible y con solape entre fragmentos consecutivos para no cortar contexto.
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;

export function chunkText(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!normalized) {
    return [];
  }

  const paragraphs = normalized
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = '';

  const flush = () => {
    if (current.trim()) {
      chunks.push(current.trim());
    }
  };

  for (const paragraph of paragraphs) {
    if (current && (current.length + paragraph.length + 2) > CHUNK_SIZE) {
      flush();
      current = current.slice(Math.max(0, current.length - CHUNK_OVERLAP));
    }

    current = current ? `${current}\n\n${paragraph}` : paragraph;

    while (current.length > CHUNK_SIZE) {
      chunks.push(current.slice(0, CHUNK_SIZE).trim());
      current = current.slice(CHUNK_SIZE - CHUNK_OVERLAP);
    }
  }

  flush();

  return chunks;
}

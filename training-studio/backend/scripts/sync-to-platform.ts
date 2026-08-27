// Único puente entre el Training Studio y la plataforma principal.
// Se ejecuta a mano (o por cron) con `npm run sync:platform`; NUNCA se
// invoca automáticamente desde el backend del Training Studio ni desde el
// de la plataforma. Usa el Prisma Client propio del Training Studio para
// leer, y un cliente `pg` aparte apuntando a PLATFORM_DATABASE_URL
// (variable de entorno que solo existe para este script) para escribir en
// las tablas knowledge_documents / knowledge_chunks de la plataforma.
import 'dotenv/config';
import { randomUUID } from 'crypto';
import { Client } from 'pg';
import { PrismaClient } from '@prisma/client';

const trainingDb = new PrismaClient();

async function main() {
  const platformUrl = process.env.PLATFORM_DATABASE_URL;
  const syncUserId = process.env.PLATFORM_SYNC_USER_ID;

  if (!platformUrl) {
    throw new Error('Falta PLATFORM_DATABASE_URL (conexión de solo-este-script hacia la DB de la plataforma)');
  }
  if (!syncUserId) {
    throw new Error(
      'Falta PLATFORM_SYNC_USER_ID: el id de un User existente en la plataforma (ej. un ADMIN) al que se atribuirán los documentos sincronizados',
    );
  }

  const entries = await trainingDb.trainingEntry.findMany({
    where: { status: 'APPROVED', syncedAt: null, piiStatus: { not: 'FLAGGED' } },
    include: { document: true, chunks: true },
    orderBy: { createdAt: 'asc' },
  });

  if (entries.length === 0) {
    console.log('No hay entradas aprobadas pendientes de sincronizar.');
    return;
  }

  // Prisma no expone columnas `Unsupported("vector")` a través del cliente
  // tipado (ni siquiera con `include`): hay que leerlas aparte con SQL crudo,
  // igual que hace el resto del backend (ver embeddings.util.ts /
  // tool-implementations.ts en la plataforma principal).
  const embeddingRows = await trainingDb.$queryRaw<{ id: string; embedding: string }[]>`
    SELECT id, embedding::text AS embedding FROM training_chunks WHERE embedding IS NOT NULL
  `;
  const embeddingByChunkId = new Map(embeddingRows.map((r) => [r.id, r.embedding]));

  const platformDb = new Client({ connectionString: platformUrl });
  await platformDb.connect();

  let synced = 0;
  let skipped = 0;

  try {
    for (const entry of entries) {
      // Defensa en profundidad: re-validar que no haya PII sin confirmar,
      // incluso si el registro cambió entre el filtro de arriba y este punto.
      if (entry.piiStatus === 'FLAGGED') {
        console.warn(`Omitida ${entry.id} (${entry.title}): PII detectada sin confirmar`);
        skipped++;
        continue;
      }
      if (entry.chunks.length === 0) {
        console.warn(`Omitida ${entry.id} (${entry.title}): no tiene fragmentos generados`);
        skipped++;
        continue;
      }

      const documentId = randomUUID();
      const sourceFileName = entry.document?.sourceFileName || `${entry.origin.toLowerCase()}-${entry.id}.txt`;
      const sourceUrl = entry.document?.sourceUrl || `training-studio://entries/${entry.id}`;

      await platformDb.query('BEGIN');
      try {
        await platformDb.query(
          `INSERT INTO knowledge_documents
             (id, title, category, "sourceFileName", "sourceUrl", status, "uploadedById", "createdAt", "updatedAt")
           VALUES ($1, $2, $3::"KnowledgeCategory", $4, $5, 'READY', $6, now(), now())`,
          [documentId, entry.title, entry.category, sourceFileName, sourceUrl, syncUserId],
        );

        for (const chunk of entry.chunks) {
          const embedding = embeddingByChunkId.get(chunk.id);
          if (!embedding) {
            // Sin embedding (por ejemplo si se ingirió sin OPENAI_API_KEY
            // configurada): se omite el fragmento, no el documento entero.
            continue;
          }
          await platformDb.query(
            `INSERT INTO knowledge_chunks (id, "documentId", "chunkIndex", content, embedding, "createdAt")
             VALUES ($1, $2, $3, $4, $5::vector, now())`,
            [randomUUID(), documentId, chunk.chunkIndex, chunk.content, embedding],
          );
        }

        await platformDb.query('COMMIT');
      } catch (error) {
        await platformDb.query('ROLLBACK');
        throw error;
      }

      await trainingDb.trainingEntry.update({
        where: { id: entry.id },
        data: { syncedAt: new Date(), syncedToPlatformId: documentId },
      });

      console.log(`Sincronizada: ${entry.title} (${entry.origin}) -> knowledge_documents/${documentId}`);
      synced++;
    }
  } finally {
    await platformDb.end();
  }

  console.log(`\nResumen: ${synced} sincronizadas, ${skipped} omitidas.`);
}

main()
  .catch((error) => {
    console.error('Error en la sincronización:', error);
    process.exitCode = 1;
  })
  .finally(() => trainingDb.$disconnect());

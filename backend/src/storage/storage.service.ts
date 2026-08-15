import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

// Llama directo a la REST API de Supabase Storage (en vez del SDK
// @supabase/supabase-js) porque ese SDK inicializa un cliente Realtime que
// requiere WebSocket nativo (Node 22+); nuestra imagen corre en Node 20 y
// solo necesitamos subir archivos y leer su URL pública.
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly url?: string;
  private readonly key?: string;
  private readonly bucket: string;

  constructor(private config: ConfigService) {
    this.url = this.config.get<string>('SUPABASE_URL');
    this.key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.bucket = this.config.get<string>('SUPABASE_STORAGE_BUCKET') || 'videos';
  }

  get isConfigured() {
    return !!this.url && !!this.key;
  }

  async uploadFile(buffer: Buffer, originalName: string, mimetype: string): Promise<string> {
    if (!this.url || !this.key) {
      throw new InternalServerErrorException(
        'El almacenamiento de archivos no está configurado (faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)',
      );
    }

    const extension = originalName.includes('.') ? originalName.split('.').pop() : undefined;
    const path = `${randomUUID()}${extension ? `.${extension}` : ''}`;

    const res = await fetch(`${this.url}/storage/v1/object/${this.bucket}/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.key}`,
        apikey: this.key,
        'Content-Type': mimetype || 'application/octet-stream',
      },
      body: new Uint8Array(buffer),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      this.logger.error(`Supabase upload failed (${res.status}): ${text}`);
      throw new InternalServerErrorException('No se pudo subir el archivo');
    }

    return `${this.url}/storage/v1/object/public/${this.bucket}/${path}`;
  }
}

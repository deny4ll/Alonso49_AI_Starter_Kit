import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: SupabaseClient | null;
  private readonly bucket: string;

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.bucket = this.config.get<string>('SUPABASE_STORAGE_BUCKET') || 'videos';
    this.client = url && key ? createClient(url, key) : null;
  }

  get isConfigured() {
    return this.client !== null;
  }

  async uploadFile(buffer: Buffer, originalName: string, mimetype: string): Promise<string> {
    if (!this.client) {
      throw new InternalServerErrorException(
        'El almacenamiento de archivos no está configurado (faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)',
      );
    }

    const extension = originalName.includes('.') ? originalName.split('.').pop() : undefined;
    const path = `${randomUUID()}${extension ? `.${extension}` : ''}`;

    const { error } = await this.client.storage.from(this.bucket).upload(path, buffer, {
      contentType: mimetype,
      upsert: false,
    });

    if (error) {
      this.logger.error(`Supabase upload failed: ${error.message}`);
      throw new InternalServerErrorException('No se pudo subir el archivo');
    }

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}

import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { IngestionModule } from '../ingestion/ingestion.module';

@Module({
  imports: [IngestionModule],
  controllers: [DocumentsController],
})
export class DocumentsModule {}

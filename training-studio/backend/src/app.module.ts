import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EntriesModule } from './modules/entries/entries.module';
import { TestChatModule } from './modules/test-chat/test-chat.module';
import { TrainersModule } from './modules/trainers/trainers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AuthModule,
    IngestionModule,
    DocumentsModule,
    EntriesModule,
    TestChatModule,
    TrainersModule,
  ],
})
export class AppModule {}

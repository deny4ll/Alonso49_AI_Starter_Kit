import { Module } from '@nestjs/common';
import { TestChatController } from './test-chat.controller';
import { TestChatService } from './test-chat.service';
import { IngestionModule } from '../ingestion/ingestion.module';

@Module({
  imports: [IngestionModule],
  controllers: [TestChatController],
  providers: [TestChatService],
})
export class TestChatModule {}

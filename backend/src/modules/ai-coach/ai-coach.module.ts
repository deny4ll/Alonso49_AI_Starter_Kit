import { Module } from '@nestjs/common';
import { AiCoachService } from './ai-coach.service';
import { AiCoachController } from './ai-coach.controller';
import { VideosModule } from '../videos/videos.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [VideosModule, SessionsModule],
  providers: [AiCoachService],
  controllers: [AiCoachController],
  exports: [AiCoachService],
})
export class AiCoachModule {}

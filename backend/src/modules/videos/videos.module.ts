import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { TagScoringService } from './tag-scoring.service';

@Module({
  providers: [VideosService, TagScoringService],
  controllers: [VideosController],
  exports: [VideosService],
})
export class VideosModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VideosModule } from './modules/videos/videos.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { TeamsModule } from './modules/teams/teams.module';
import { CoursesModule } from './modules/courses/courses.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VideosModule,
    SessionsModule,
    TeamsModule,
    CoursesModule,
    AnalyticsModule,
  ],
})
export class AppModule {}

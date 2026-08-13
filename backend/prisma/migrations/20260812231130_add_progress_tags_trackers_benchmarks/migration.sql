-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('VIDEO', 'REPORT');

-- CreateEnum
CREATE TYPE "TagLevel" AS ENUM ('SECTION', 'SUBSECTION');

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "recordedAt" TIMESTAMP(3),
ADD COLUMN     "teamId" TEXT,
ADD COLUMN     "type" "VideoType" NOT NULL DEFAULT 'VIDEO',
ADD COLUMN     "waveHeight" DOUBLE PRECISION,
ADD COLUMN     "windSpeed" DOUBLE PRECISION,
ALTER COLUMN "url" DROP NOT NULL;

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "level" "TagLevel" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_tags" (
    "videoId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_tags_pkey" PRIMARY KEY ("videoId","tagId")
);

-- CreateTable
CREATE TABLE "progress_summaries" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_benchmarks" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "label" TEXT NOT NULL DEFAULT 'Equipo Target AI',
    "averageSpeed" DOUBLE PRECISION,
    "maxSpeed" DOUBLE PRECISION,
    "tackingEfficiency" DOUBLE PRECISION,
    "performanceScore" DOUBLE PRECISION,
    "daysOnWaterPerMonth" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gps_tracks" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "source" TEXT,
    "originalFileName" TEXT,
    "points" JSONB NOT NULL,
    "distanceMeters" DOUBLE PRECISION,
    "durationSeconds" INTEGER,
    "averageSpeed" DOUBLE PRECISION,
    "maxSpeed" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gps_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_coach_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ai_coach_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_key_key" ON "tags"("key");

-- CreateIndex
CREATE INDEX "tags_parentId_idx" ON "tags"("parentId");

-- CreateIndex
CREATE INDEX "tags_level_idx" ON "tags"("level");

-- CreateIndex
CREATE INDEX "video_tags_tagId_idx" ON "video_tags"("tagId");

-- CreateIndex
CREATE INDEX "progress_summaries_teamId_idx" ON "progress_summaries"("teamId");

-- CreateIndex
CREATE INDEX "team_benchmarks_teamId_idx" ON "team_benchmarks"("teamId");

-- CreateIndex
CREATE INDEX "gps_tracks_sessionId_idx" ON "gps_tracks"("sessionId");

-- CreateIndex
CREATE INDEX "gps_tracks_uploadedById_idx" ON "gps_tracks"("uploadedById");

-- CreateIndex
CREATE INDEX "ai_coach_sessions_userId_idx" ON "ai_coach_sessions"("userId");

-- CreateIndex
CREATE INDEX "ai_coach_sessions_lastActivityAt_idx" ON "ai_coach_sessions"("lastActivityAt");

-- CreateIndex
CREATE INDEX "videos_teamId_idx" ON "videos"("teamId");

-- CreateIndex
CREATE INDEX "videos_type_idx" ON "videos"("type");

-- CreateIndex
CREATE INDEX "videos_recordedAt_idx" ON "videos"("recordedAt");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_tags" ADD CONSTRAINT "video_tags_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_tags" ADD CONSTRAINT "video_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_summaries" ADD CONSTRAINT "progress_summaries_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_summaries" ADD CONSTRAINT "progress_summaries_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_benchmarks" ADD CONSTRAINT "team_benchmarks_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps_tracks" ADD CONSTRAINT "gps_tracks_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps_tracks" ADD CONSTRAINT "gps_tracks_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_coach_sessions" ADD CONSTRAINT "ai_coach_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

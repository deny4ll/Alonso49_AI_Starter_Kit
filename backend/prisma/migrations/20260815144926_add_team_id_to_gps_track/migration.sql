-- AlterTable
ALTER TABLE "gps_tracks" ADD COLUMN     "teamId" TEXT;

-- CreateIndex
CREATE INDEX "gps_tracks_teamId_idx" ON "gps_tracks"("teamId");

-- AddForeignKey
ALTER TABLE "gps_tracks" ADD CONSTRAINT "gps_tracks_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

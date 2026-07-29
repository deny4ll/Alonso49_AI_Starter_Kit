/*
  Warnings:

  - You are about to drop the column `createdById` on the `feedback` table. All the data in the column will be lost.
  - Added the required column `coachId` to the `feedback` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_createdById_fkey";

-- DropIndex
DROP INDEX "feedback_createdById_idx";

-- AlterTable
ALTER TABLE "athlete_profiles" ADD COLUMN     "assignedCoach" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "boatSetup" TEXT,
ADD COLUMN     "currentMicrocycle" TEXT,
ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "kpis" JSONB,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "nextEvent" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "seasonGoal" TEXT,
ADD COLUMN     "todayObjective" TEXT,
ADD COLUMN     "weeklyObjectives" TEXT;

-- AlterTable
ALTER TABLE "feedback" DROP COLUMN "createdById",
ADD COLUMN     "coachId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "feedback_coachId_idx" ON "feedback"("coachId");

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

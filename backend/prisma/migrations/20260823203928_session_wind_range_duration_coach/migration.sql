-- Replace single-value windSpeed with a range (windSpeedMin/windSpeedMax), and add
-- durationHours + coachOnWater to support the "sesiones" feedback (planned vs actual
-- wind range, training hours, coach-on-water flag).
ALTER TABLE "sessions" ADD COLUMN "windSpeedMin" DOUBLE PRECISION;
ALTER TABLE "sessions" ADD COLUMN "windSpeedMax" DOUBLE PRECISION;
ALTER TABLE "sessions" ADD COLUMN "durationHours" DOUBLE PRECISION;
ALTER TABLE "sessions" ADD COLUMN "coachOnWater" BOOLEAN;

-- Backfill existing single-value wind speeds into the new range columns.
UPDATE "sessions" SET "windSpeedMin" = "windSpeed", "windSpeedMax" = "windSpeed" WHERE "windSpeed" IS NOT NULL;

ALTER TABLE "sessions" DROP COLUMN "windSpeed";

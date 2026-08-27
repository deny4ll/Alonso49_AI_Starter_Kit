-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "TrainerRole" AS ENUM ('TRAINER', 'ADMIN');

-- CreateEnum
CREATE TYPE "EntryOrigin" AS ENUM ('UPLOAD', 'MANUAL', 'CORRECTION');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "PiiStatus" AS ENUM ('CLEAN', 'FLAGGED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "KnowledgeCategory" AS ENUM ('methodology', 'technique', 'tactics', 'boat_setup', 'physical_prep', 'mental_prep');

-- CreateTable
CREATE TABLE "trainers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "TrainerRole" NOT NULL DEFAULT 'TRAINER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_entries" (
    "id" TEXT NOT NULL,
    "origin" "EntryOrigin" NOT NULL,
    "title" TEXT NOT NULL,
    "category" "KnowledgeCategory" NOT NULL,
    "content" TEXT NOT NULL,
    "question" TEXT,
    "aiAnswer" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'READY',
    "errorMessage" TEXT,
    "piiStatus" "PiiStatus" NOT NULL DEFAULT 'CLEAN',
    "piiFindings" JSONB,
    "piiConfirmedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),
    "syncedToPlatformId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_documents" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "sourceFileName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_chunks" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trainers_email_key" ON "trainers"("email");

-- CreateIndex
CREATE INDEX "training_entries_status_idx" ON "training_entries"("status");

-- CreateIndex
CREATE INDEX "training_entries_origin_idx" ON "training_entries"("origin");

-- CreateIndex
CREATE INDEX "training_entries_category_idx" ON "training_entries"("category");

-- CreateIndex
CREATE UNIQUE INDEX "training_documents_entryId_key" ON "training_documents"("entryId");

-- CreateIndex
CREATE INDEX "training_chunks_entryId_idx" ON "training_chunks"("entryId");

-- AddForeignKey
ALTER TABLE "training_entries" ADD CONSTRAINT "training_entries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_entries" ADD CONSTRAINT "training_entries_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "trainers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_documents" ADD CONSTRAINT "training_documents_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "training_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_chunks" ADD CONSTRAINT "training_chunks_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "training_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

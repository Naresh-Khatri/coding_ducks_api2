/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Exam" ALTER COLUMN "slug" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Exam_slug_key" ON "Exam"("slug");

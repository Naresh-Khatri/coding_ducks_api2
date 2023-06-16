/*
  Warnings:

  - A unique constraint covering the columns `[frontendProblemId]` on the table `Problem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "frontendProblemId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Problem_frontendProblemId_key" ON "Problem"("frontendProblemId");

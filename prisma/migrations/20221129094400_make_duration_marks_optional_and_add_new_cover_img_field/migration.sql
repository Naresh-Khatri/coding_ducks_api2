/*
  Warnings:

  - Added the required column `coverImg` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "coverImg" TEXT NOT NULL,
ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "marks" DROP NOT NULL;

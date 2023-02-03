/*
  Warnings:

  - You are about to drop the column `userId` on the `Submission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_userId_fkey";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "userId";

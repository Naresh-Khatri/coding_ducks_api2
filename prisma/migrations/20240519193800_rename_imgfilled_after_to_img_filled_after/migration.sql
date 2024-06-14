/*
  Warnings:

  - You are about to drop the column `imgfilledAfter` on the `ChallengeAttempt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChallengeAttempt" DROP COLUMN "imgfilledAfter",
ADD COLUMN     "imgFilledAfter" TEXT DEFAULT '';

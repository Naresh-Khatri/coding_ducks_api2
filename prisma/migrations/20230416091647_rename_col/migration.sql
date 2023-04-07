/*
  Warnings:

  - You are about to drop the column `futureEvent` on the `Feedback` table. All the data in the column will be lost.
  - Added the required column `interestInFutureEvents` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "futureEvent",
ADD COLUMN     "interestInFutureEvents" BOOLEAN NOT NULL;

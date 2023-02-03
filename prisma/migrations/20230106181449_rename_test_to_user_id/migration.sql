/*
  Warnings:

  - You are about to drop the column `test` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "test",
ALTER COLUMN "userId" DROP DEFAULT;

/*
  Warnings:

  - Made the column `tests` on table `Submission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "tests" SET NOT NULL;

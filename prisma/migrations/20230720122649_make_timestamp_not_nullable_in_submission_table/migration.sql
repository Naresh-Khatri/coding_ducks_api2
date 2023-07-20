/*
  Warnings:

  - Made the column `timestamp` on table `Submission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "photoURL" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "timestamp" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "photoURL" DROP NOT NULL;

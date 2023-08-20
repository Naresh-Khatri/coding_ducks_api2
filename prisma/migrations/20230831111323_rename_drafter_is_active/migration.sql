/*
  Warnings:

  - You are about to drop the column `drafted` on the `Problem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "drafted",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;

/*
  Warnings:

  - You are about to drop the column `contentHead` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "contentHead",
ADD COLUMN     "contentHEAD" TEXT DEFAULT '<script src="https://cdn.tailwindcss.com"></script>';

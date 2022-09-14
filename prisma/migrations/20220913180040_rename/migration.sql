/*
  Warnings:

  - You are about to drop the column `content` on the `File` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "content",
ADD COLUMN     "code" TEXT NOT NULL DEFAULT '';

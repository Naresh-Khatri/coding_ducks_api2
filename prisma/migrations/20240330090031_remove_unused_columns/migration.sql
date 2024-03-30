/*
  Warnings:

  - You are about to drop the column `content` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `lang` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `yDoc` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "content",
DROP COLUMN "lang",
DROP COLUMN "type",
DROP COLUMN "yDoc";

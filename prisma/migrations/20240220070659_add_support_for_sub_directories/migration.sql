/*
  Warnings:

  - You are about to drop the column `directoryId` on the `File` table. All the data in the column will be lost.
  - Added the required column `parentDirId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_directoryId_fkey";

-- AlterTable
ALTER TABLE "Directory" ADD COLUMN     "parentDirId" INTEGER;

-- AlterTable
ALTER TABLE "File" DROP COLUMN "directoryId",
ADD COLUMN     "parentDirId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Directory" ADD CONSTRAINT "Directory_parentDirId_fkey" FOREIGN KEY ("parentDirId") REFERENCES "Directory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_parentDirId_fkey" FOREIGN KEY ("parentDirId") REFERENCES "Directory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

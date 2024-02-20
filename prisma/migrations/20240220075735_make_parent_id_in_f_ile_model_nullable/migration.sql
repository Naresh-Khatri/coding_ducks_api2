-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_parentDirId_fkey";

-- AlterTable
ALTER TABLE "File" ALTER COLUMN "parentDirId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_parentDirId_fkey" FOREIGN KEY ("parentDirId") REFERENCES "Directory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

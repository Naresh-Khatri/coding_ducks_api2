-- DropForeignKey
ALTER TABLE "Problem" DROP CONSTRAINT "Problem_examId_fkey";

-- AlterTable
ALTER TABLE "Problem" ALTER COLUMN "examId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

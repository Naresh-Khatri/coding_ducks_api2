-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_examId_fkey";

-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "examId" DROP NOT NULL,
ALTER COLUMN "examId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

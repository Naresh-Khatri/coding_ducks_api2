-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "userId" INTEGER NOT NULL DEFAULT 54;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

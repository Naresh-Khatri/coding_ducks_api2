/*
  Warnings:

  - You are about to drop the column `examId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_examId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "examId";

-- CreateTable
CREATE TABLE "_ExamToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ExamToUser_AB_unique" ON "_ExamToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ExamToUser_B_index" ON "_ExamToUser"("B");

-- AddForeignKey
ALTER TABLE "_ExamToUser" ADD CONSTRAINT "_ExamToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExamToUser" ADD CONSTRAINT "_ExamToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

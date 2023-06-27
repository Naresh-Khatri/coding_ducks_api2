/*
  Warnings:

  - You are about to drop the `StarterCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StarterCode" DROP CONSTRAINT "StarterCode_problemId_fkey";

-- DropTable
DROP TABLE "StarterCode";

-- CreateTable
CREATE TABLE "ProblemStarterCode" (
    "id" SERIAL NOT NULL,
    "lang" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "problemId" INTEGER NOT NULL,

    CONSTRAINT "ProblemStarterCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProblemStarterCode" ADD CONSTRAINT "ProblemStarterCode_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

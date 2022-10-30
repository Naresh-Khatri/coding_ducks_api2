/*
  Warnings:

  - You are about to drop the column `constraints` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `input` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `marks` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `output` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `sample_input` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `sample_output` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `testCasesId` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the `TestCases` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `testCases` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Problem" DROP CONSTRAINT "Problem_testCasesId_fkey";

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "constraints",
DROP COLUMN "input",
DROP COLUMN "marks",
DROP COLUMN "output",
DROP COLUMN "sample_input",
DROP COLUMN "sample_output",
DROP COLUMN "testCasesId",
ADD COLUMN     "testCases" JSON NOT NULL;

-- DropTable
DROP TABLE "TestCases";

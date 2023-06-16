/*
  Warnings:

  - You are about to drop the column `tags` on the `Problem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "ProblemTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ProblemTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProblemToProblemTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ProblemTag_name_key" ON "ProblemTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ProblemToProblemTag_AB_unique" ON "_ProblemToProblemTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ProblemToProblemTag_B_index" ON "_ProblemToProblemTag"("B");

-- AddForeignKey
ALTER TABLE "_ProblemToProblemTag" ADD CONSTRAINT "_ProblemToProblemTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemToProblemTag" ADD CONSTRAINT "_ProblemToProblemTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ProblemTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

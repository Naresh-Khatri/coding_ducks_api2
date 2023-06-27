-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "starterCodeId" INTEGER;

-- CreateTable
CREATE TABLE "StarterCode" (
    "id" SERIAL NOT NULL,
    "lang" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "problemId" INTEGER NOT NULL,

    CONSTRAINT "StarterCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StarterCode" ADD CONSTRAINT "StarterCode_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

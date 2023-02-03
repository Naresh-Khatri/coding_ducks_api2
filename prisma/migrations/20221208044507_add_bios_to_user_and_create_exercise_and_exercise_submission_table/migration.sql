-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT;

-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cover_img" TEXT NOT NULL,
    "sections" JSONB[],
    "answers" TEXT[],

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseSubmission" (
    "id" SERIAL NOT NULL,
    "exerciseID" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ExerciseSubmission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExerciseSubmission" ADD CONSTRAINT "ExerciseSubmission_exerciseID_fkey" FOREIGN KEY ("exerciseID") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSubmission" ADD CONSTRAINT "ExerciseSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

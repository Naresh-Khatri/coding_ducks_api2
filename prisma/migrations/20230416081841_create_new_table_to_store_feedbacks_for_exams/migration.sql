-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "examId" INTEGER NOT NULL,
    "author" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "ui" INTEGER NOT NULL,
    "usefulness" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "futureEvent" BOOLEAN NOT NULL,
    "comment" TEXT,
    "time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_author_fkey" FOREIGN KEY ("author") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

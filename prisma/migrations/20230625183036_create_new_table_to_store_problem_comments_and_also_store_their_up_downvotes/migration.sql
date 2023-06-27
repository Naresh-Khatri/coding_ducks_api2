-- CreateTable
CREATE TABLE "ProblemComment" (
    "id" SERIAL NOT NULL,
    "problemId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProblemComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProblemLikes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProblemDislikes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CommentUpvotes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CommentDownvotes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProblemLikes_AB_unique" ON "_ProblemLikes"("A", "B");

-- CreateIndex
CREATE INDEX "_ProblemLikes_B_index" ON "_ProblemLikes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProblemDislikes_AB_unique" ON "_ProblemDislikes"("A", "B");

-- CreateIndex
CREATE INDEX "_ProblemDislikes_B_index" ON "_ProblemDislikes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CommentUpvotes_AB_unique" ON "_CommentUpvotes"("A", "B");

-- CreateIndex
CREATE INDEX "_CommentUpvotes_B_index" ON "_CommentUpvotes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CommentDownvotes_AB_unique" ON "_CommentDownvotes"("A", "B");

-- CreateIndex
CREATE INDEX "_CommentDownvotes_B_index" ON "_CommentDownvotes"("B");

-- AddForeignKey
ALTER TABLE "ProblemComment" ADD CONSTRAINT "ProblemComment_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemComment" ADD CONSTRAINT "ProblemComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemLikes" ADD CONSTRAINT "_ProblemLikes_A_fkey" FOREIGN KEY ("A") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemLikes" ADD CONSTRAINT "_ProblemLikes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemDislikes" ADD CONSTRAINT "_ProblemDislikes_A_fkey" FOREIGN KEY ("A") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemDislikes" ADD CONSTRAINT "_ProblemDislikes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentUpvotes" ADD CONSTRAINT "_CommentUpvotes_A_fkey" FOREIGN KEY ("A") REFERENCES "ProblemComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentUpvotes" ADD CONSTRAINT "_CommentUpvotes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentDownvotes" ADD CONSTRAINT "_CommentDownvotes_A_fkey" FOREIGN KEY ("A") REFERENCES "ProblemComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentDownvotes" ADD CONSTRAINT "_CommentDownvotes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

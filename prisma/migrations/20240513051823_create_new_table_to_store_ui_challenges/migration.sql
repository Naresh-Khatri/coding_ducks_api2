-- CreateEnum
CREATE TYPE "ChallengeDiff" AS ENUM ('newbie', 'junior', 'intermediate', 'advanced', 'master');

-- CreateTable
CREATE TABLE "Challenge" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT NOT NULL,
    "difficulty" "ChallengeDiff" NOT NULL,
    "mobilePreview" TEXT NOT NULL,
    "desktopPreview" TEXT NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_slug_key" ON "Challenge"("slug");

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

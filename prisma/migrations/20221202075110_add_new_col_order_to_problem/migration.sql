-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "followersIDs" INTEGER[],
ADD COLUMN     "followingIDs" INTEGER[];

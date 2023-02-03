/*
  Warnings:

  - You are about to drop the column `followersIDs` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `followingIDs` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "followersIDs",
DROP COLUMN "followingIDs",
ADD COLUMN     "followers" INTEGER[],
ADD COLUMN     "following" INTEGER[];

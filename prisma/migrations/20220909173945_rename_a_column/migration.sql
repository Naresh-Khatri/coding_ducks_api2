/*
  Warnings:

  - You are about to drop the column `google_uid` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `photo_url` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleUID]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `googleUID` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photoURL` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_google_uid_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "google_uid",
DROP COLUMN "photo_url",
ADD COLUMN     "googleUID" VARCHAR(30) NOT NULL,
ADD COLUMN     "photoURL" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_googleUID_key" ON "User"("googleUID");

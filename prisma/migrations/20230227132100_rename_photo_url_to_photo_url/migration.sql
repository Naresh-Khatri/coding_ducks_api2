/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `Message` table. All the data in the column will be lost.
  - Added the required column `photoURL` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "photoUrl",
ADD COLUMN     "photoURL" TEXT NOT NULL;

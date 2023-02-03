/*
  Warnings:

  - You are about to drop the column `name` on the `Problem` table. All the data in the column will be lost.
  - The `tags` column on the `Problem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `title` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "difficulty" SET DATA TYPE TEXT,
DROP COLUMN "tags",
ADD COLUMN     "tags" TEXT[];

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('web', 'normal');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "type" "RoomType" NOT NULL DEFAULT 'normal';

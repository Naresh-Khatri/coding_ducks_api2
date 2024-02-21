-- AlterTable
ALTER TABLE "Directory" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDeletable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDeletable" BOOLEAN NOT NULL DEFAULT false;

/*
  Warnings:

  - The `content` column on the `cover_letters` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "cover_letters" ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "template" TEXT NOT NULL DEFAULT 'Modern',
DROP COLUMN "content",
ADD COLUMN     "content" JSONB;

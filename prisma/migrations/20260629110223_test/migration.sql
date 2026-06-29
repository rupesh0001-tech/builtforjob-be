-- AlterTable
ALTER TABLE "cover_letters" ADD COLUMN     "isMagic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profileSynced" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "isGithubSynced" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "skills" ADD COLUMN     "isGithubSynced" BOOLEAN NOT NULL DEFAULT false;

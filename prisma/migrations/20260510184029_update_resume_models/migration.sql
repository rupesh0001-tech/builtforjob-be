-- AlterTable
ALTER TABLE "resume_versions" ADD COLUMN     "content" JSONB;

-- AlterTable
ALTER TABLE "resumes" ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT true;

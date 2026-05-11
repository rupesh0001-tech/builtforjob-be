-- AlterTable
ALTER TABLE "application_versions" ADD COLUMN     "resumeId" TEXT,
ALTER COLUMN "resumeUrl" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "application_versions" ADD CONSTRAINT "application_versions_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

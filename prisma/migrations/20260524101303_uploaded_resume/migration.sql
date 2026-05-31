-- CreateTable
CREATE TABLE "ats_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeName" TEXT NOT NULL,
    "resumeUrl" TEXT,
    "resumeText" TEXT,
    "jobDescription" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "resumeWordCount" INTEGER NOT NULL,
    "jdWordCount" INTEGER NOT NULL,
    "suggestions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ats_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ats_reports" ADD CONSTRAINT "ats_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "application_versions" (
    "id" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "resumeUrl" TEXT NOT NULL,
    "coverLetterUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_versions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "application_versions" ADD CONSTRAINT "application_versions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

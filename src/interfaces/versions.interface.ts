export interface IApplicationVersion {
  id: string;
  versionName: string;
  companyName: string;
  resumeUrl?: string | null;
  resumeId?: string | null;
  coverLetterUrl?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

import { PrismaClient } from "@prisma/client";
import { uploadToImageKit } from "../imagekit/imagekit.service";

const prisma = new PrismaClient();

export const createVersion = async (data: {
  versionName: string;
  companyName: string;
  resumeBuffer?: Buffer;
  resumeName?: string;
  resumeUrl?: string;
  resumeId?: string;
  coverLetterBuffer?: Buffer;
  coverLetterName?: string;
  coverLetterUrl?: string;
  userId: string;
}) => {
  let finalResumeUrl = data.resumeUrl;

  // Upload Resume if buffer provided
  if (data.resumeBuffer && data.resumeName) {
    const resumeUpload = await uploadToImageKit(
      data.resumeBuffer,
      `resume_${Date.now()}_${data.resumeName}`
    );
    finalResumeUrl = resumeUpload.url;
  }

  // Upload Cover Letter if buffer provided
  let finalCoverLetterUrl = data.coverLetterUrl;
  if (data.coverLetterBuffer && data.coverLetterName) {
    const clUpload = await uploadToImageKit(
      data.coverLetterBuffer,
      `cl_${Date.now()}_${data.coverLetterName}`
    );
    finalCoverLetterUrl = clUpload.url;
  }

  // Save to DB
  return await prisma.applicationVersion.create({
    data: {
      versionName: data.versionName,
      companyName: data.companyName,
      resumeUrl: finalResumeUrl,
      resumeId: data.resumeId,
      coverLetterUrl: finalCoverLetterUrl,
      userId: data.userId,
    },
  });
};

export const getAllVersions = async (userId: string) => {
  return await prisma.applicationVersion.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { resume: true },
  });
};

export const deleteVersion = async (id: string, userId: string) => {
  // Check ownership
  const version = await prisma.applicationVersion.findFirst({
    where: { id, userId },
  });

  if (!version) {
    throw new Error("Version not found or unauthorized");
  }

  // Delete from DB
  return await prisma.applicationVersion.delete({
    where: { id },
  });
};

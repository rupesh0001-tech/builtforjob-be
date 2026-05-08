import { PrismaClient } from "@prisma/client";
import { uploadToImageKit } from "../imagekit/imagekit.service";

const prisma = new PrismaClient();

export const createVersion = async (data: {
  versionName: string;
  companyName: string;
  resumeBuffer: Buffer;
  resumeName: string;
  coverLetterBuffer?: Buffer;
  coverLetterName?: string;
  userId: string;
}) => {
  // Upload Resume
  const resumeUpload = await uploadToImageKit(
    data.resumeBuffer,
    `resume_${Date.now()}_${data.resumeName}`
  );

  // Upload Cover Letter if provided
  let coverLetterUrl = null;
  if (data.coverLetterBuffer && data.coverLetterName) {
    const clUpload = await uploadToImageKit(
      data.coverLetterBuffer,
      `cl_${Date.now()}_${data.coverLetterName}`
    );
    coverLetterUrl = clUpload.url;
  }

  // Save to DB
  return await prisma.applicationVersion.create({
    data: {
      versionName: data.versionName,
      companyName: data.companyName,
      resumeUrl: resumeUpload.url,
      coverLetterUrl,
      userId: data.userId,
    },
  });
};

export const getAllVersions = async (userId: string) => {
  return await prisma.applicationVersion.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
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

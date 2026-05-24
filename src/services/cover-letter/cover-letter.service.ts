import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CoverLetterService {
  async createCoverLetter(userId: string, data: {
    title: string;
    company?: string;
    recipient?: string;
    template?: string;
    content?: any;
    isDraft?: boolean;
  }) {
    return prisma.coverLetter.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getAllCoverLetters(userId: string) {
    return prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getCoverLetterById(userId: string, id: string) {
    return prisma.coverLetter.findFirst({
      where: { id, userId },
    });
  }

  async updateCoverLetter(userId: string, id: string, data: {
    title?: string;
    company?: string;
    recipient?: string;
    template?: string;
    content?: any;
    isDraft?: boolean;
  }) {
    return prisma.coverLetter.update({
      where: { id, userId },
      data,
    });
  }

  async deleteCoverLetter(userId: string, id: string) {
    return prisma.coverLetter.delete({
      where: { id, userId },
    });
  }
}

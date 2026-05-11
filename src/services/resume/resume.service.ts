import prisma from '../../config/database/db';

export class ResumeService {
  static async createResume(userId: string, data: { title?: string; template?: string; content?: any; isDraft?: boolean }) {
    // Handle naming logic for untitled resumes
    let finalTitle = data.title;
    if (!finalTitle) {
      const count = await prisma.resume.count({
        where: { userId, title: { startsWith: 'Untitled-' } }
      });
      finalTitle = `Untitled-${count + 1}`;
    }

    return prisma.resume.create({
      data: {
        title: finalTitle,
        template: data.template || 'Modern',
        content: data.content || {},
        isDraft: data.isDraft !== undefined ? data.isDraft : false,
        userId: userId,
      }
    });
  }

  static async updateResume(resumeId: string, userId: string, data: { title?: string; template?: string; content?: any; isDraft?: boolean }) {
    return prisma.resume.update({
      where: { id: resumeId, userId },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    });
  }

  static async createVersion(resumeId: string, userId: string, data: { company?: string; role?: string; content: any }) {
    // First ensure the resume belongs to the user
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId }
    });

    if (!resume) {
      throw new Error('Resume not found or unauthorized');
    }

    return prisma.resumeVersion.create({
      data: {
        resumeId,
        company: data.company || 'General',
        role: data.role || 'Snapshot',
        content: data.content,
        status: 'Active'
      }
    });
  }

  static async getResumes(userId: string) {
    return prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { versions: true }
        }
      }
    });
  }

  static async getResumeById(resumeId: string, userId: string) {
    return prisma.resume.findUnique({
      where: { id: resumeId, userId },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  static async deleteResume(resumeId: string, userId: string) {
    return prisma.resume.delete({
      where: { id: resumeId, userId }
    });
  }

  static async getVersions(resumeId: string, userId: string) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId }
    });

    if (!resume) {
      throw new Error('Resume not found or unauthorized');
    }

    return prisma.resumeVersion.findMany({
      where: { resumeId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

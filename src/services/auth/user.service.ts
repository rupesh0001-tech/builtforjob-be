import prisma from '../../config/database/db';
import type { IUser } from '../../interfaces/user.interface';

export class UserService {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        skills: true,
        experience: true,
        education: true,
        projects: true,
      }
    });
  }

  static async createUser(data: Omit<IUser, 'id' | 'isVerified' | 'createdAt' | 'updatedAt'>) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
  }

  static async verifyUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });
  }

  static async updateUser(id: string, data: any) {
    const { skills, experience, education, projects, ...basicData } = data;

    // Strict whitelisting of allowed fields to prevent Prisma errors with internal fields
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'location', 
      'jobTitle', 'bio', 'socialLinks'
    ];

    const filteredData: any = {};
    allowedFields.forEach(field => {
      if (basicData[field] !== undefined) {
        filteredData[field] = basicData[field];
      }
    });

    return prisma.user.update({
      where: { id },
      data: {
        ...filteredData,
        skills: skills ? {
          deleteMany: {},
          create: skills.map((s: any) => ({ 
            name: s.name,
            isGithubSynced: !!s.isGithubSynced
          }))
        } : undefined,
        experience: experience ? {
          deleteMany: {},
          create: experience.map((e: any) => ({
            company: e.company,
            position: e.position,
            startDate: e.startDate,
            endDate: e.endDate,
            description: e.description,
            isCurrent: !!e.isCurrent
          }))
        } : undefined,
        education: education ? {
          deleteMany: {},
          create: education.map((ed: any) => ({
            institution: ed.institution,
            degree: ed.degree,
            field: ed.field,
            graduationDate: ed.graduationDate,
            gpa: ed.gpa,
            graduationType: ed.graduationType
          }))
        } : undefined,
        projects: projects ? {
          deleteMany: {},
          create: projects.map((p: any) => ({
            name: p.name,
            techStack: p.techStack,
            description: p.description,
            isGithubSynced: !!p.isGithubSynced
          }))
        } : undefined,
      },
      include: {
        skills: true,
        experience: true,
        education: true,
        projects: true,
      }
    });
  }
}

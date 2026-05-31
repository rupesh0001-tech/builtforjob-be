import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';
import type { ISkill, IExperience, IEducation, IProject } from '../../interfaces/user.interface';

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { skills, experience, education, projects, ...basicData } = req.body;

    const allowedFields = [
      'firstName', 'lastName', 'phone', 'location', 
      'jobTitle', 'bio', 'socialLinks', 'avatarUrl',
      'profileSynced'
    ];

    const filteredData: Record<string, unknown> = {};
    allowedFields.forEach(field => {
      if (basicData[field] !== undefined) {
        filteredData[field] = basicData[field];
      }
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...filteredData,
        skills: skills ? {
          deleteMany: {},
          create: (skills as ISkill[]).map((s) => ({ 
            name: s.name,
            isGithubSynced: !!s.isGithubSynced
          }))
        } : undefined,
        experience: experience ? {
          deleteMany: {},
          create: (experience as IExperience[]).map((e) => ({
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
          create: (education as IEducation[]).map((ed) => ({
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
          create: (projects as IProject[]).map((p) => ({
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

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function getCompanies(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 1. Fetch global company intelligence profiles
    const globalProfiles = await prisma.companyProfile.findMany({
      orderBy: { name: 'asc' }
    });

    // 2. Fetch user's targeted custom companies
    const userCompanies = await prisma.userCompany.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    });

    const formattedGlobals = globalProfiles.map(c => ({
      id: c.id,
      name: c.name,
      industry: c.industry,
      hiringStyle: c.hiringStyle,
      preferredSkills: c.preferredSkills,
      technologiesUsed: c.technologiesUsed,
      engineeringCulture: c.engineeringCulture,
      atsKeywords: c.atsKeywords,
      commonInterviewFocus: c.commonInterviewFocus,
      resumeOptimizationKeys: c.resumeOptimizationKeys,
      coverLetterTone: c.coverLetterTone,
      isCustom: false
    }));

    const formattedCustom = userCompanies.map(c => ({
      id: c.id,
      name: c.name,
      isCustom: true
    }));

    // Combine them: custom targets first, then global profiles
    return res.json({
      success: true,
      data: [...formattedCustom, ...formattedGlobals]
    });
  } catch (error) {
    next(error);
  }
}

export async function createCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const trimmedName = name.trim();

    // Check if this company exists globally or is already added by the user
    const existingCustom = await prisma.userCompany.findFirst({
      where: {
        userId,
        name: {
          equals: trimmedName,
          mode: 'insensitive'
        }
      }
    });

    if (existingCustom) {
      return res.status(400).json({ success: false, message: 'Company already exists in your list' });
    }

    // Check if it exists globally
    const existingGlobal = await prisma.companyProfile.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: 'insensitive'
        }
      }
    });

    if (existingGlobal) {
      return res.status(400).json({ success: false, message: 'This company profile already exists as a global company' });
    }

    const customCompany = await prisma.userCompany.create({
      data: {
        name: trimmedName,
        userId
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        id: customCompany.id,
        name: customCompany.name,
        isCustom: true
      }
    });
  } catch (error) {
    next(error);
  }
}

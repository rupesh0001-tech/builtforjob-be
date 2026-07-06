import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function getPortfolio(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    return res.status(200).json(portfolio);
  } catch (error) {
    next(error);
  }
}

export async function savePortfolio(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { templateId, data, settings } = req.body;

    const portfolio = await prisma.portfolio.upsert({
      where: { userId },
      update: {
        templateId,
        data,
        settings,
      },
      create: {
        userId,
        templateId,
        data,
        settings,
      },
    });

    return res.status(200).json(portfolio);
  } catch (error) {
    next(error);
  }
}

export async function getPortfolioResponses(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!portfolio) {
      return res.status(200).json({ responses: [], totalPages: 0, totalResponses: 0 });
    }

    const [responses, totalResponses] = await prisma.$transaction([
      prisma.portfolioResponse.findMany({
        where: { portfolioId: portfolio.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.portfolioResponse.count({
        where: { portfolioId: portfolio.id },
      }),
    ]);

    const totalPages = Math.ceil(totalResponses / limit);

    return res.status(200).json({
      responses,
      totalPages,
      totalResponses,
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrCreatePortfolio(user: any) {
  if (user.portfolio) {
    return user.portfolio;
  }

  const skillGroups = user.skills?.length > 0 
    ? [{ category: "Skills", items: user.skills.map((s: any) => s.name) }]
    : [{ category: "Frontend", items: ["React", "TypeScript", "Tailwind CSS"] }];

  const experienceItems = user.experience?.map((exp: any, idx: number) => ({
    id: exp.id || `exp-${idx}`,
    company: exp.company,
    role: exp.position,
    duration: `${exp.startDate} - ${exp.endDate || "Present"}`,
    responsibilities: exp.description ? [exp.description] : ["Software Engineer"],
    technologies: []
  })) || [];

  const educationItems = user.education?.map((edu: any, idx: number) => ({
    id: edu.id || `edu-${idx}`,
    degree: edu.degree,
    field: edu.field,
    institution: edu.institution,
    duration: edu.graduationDate,
    gpa: edu.gpa || undefined
  })) || [];

  const projectItems = user.projects?.map((proj: any, idx: number) => ({
    id: proj.id || `proj-${idx}`,
    name: proj.name,
    description: proj.description || "Personal Project",
    techStack: proj.techStack ? proj.techStack.split(",").map((s: string) => s.trim()) : [],
    features: [],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop"
  })) || [];

  const defaultData = {
    personalInfo: {
      fullName: `${user.firstName} ${user.lastName}`,
      jobTitle: user.jobTitle || "Full-Stack Developer",
      tagline: `Hi, I'm ${user.firstName}. I build clean web interfaces and scalable backends.`,
      bio: user.bio || "Software engineer passionate about building developer tools.",
      email: user.email,
      phone: user.phone || "",
      location: user.location || "India",
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.firstName}`,
      isOpenToWork: true,
      socialLinks: user.socialLinks ? (user.socialLinks as any) : {}
    },
    aboutMe: {
      paragraphs: [user.bio || "Software engineer passionate about building developer tools."]
    },
    techStack: skillGroups,
    projects: projectItems,
    experience: experienceItems,
    education: educationItems,
    skills: skillGroups,
    achievements: [],
    codingProfiles: [],
    customSections: []
  };

  return await prisma.portfolio.create({
    data: {
      userId: user.id,
      templateId: "architect-prismatic",
      data: defaultData as any,
      settings: {
        theme: "dark",
        accentColor: "#001BB7",
        fontFamily: "Inter"
      } as any
    }
  });
}

export async function getPublicPortfolio(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        firstName: {
          equals: username,
          mode: "insensitive",
        },
      },
      include: {
        portfolio: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.portfolio) {
      return res.status(404).json({ error: "Portfolio not created yet" });
    }

    const settings = user.portfolio.settings as any;
    if (!settings || !settings.isPublished) {
      return res.status(404).json({ error: "This portfolio is private or hidden" });
    }

    return res.status(200).json({
      portfolio: user.portfolio,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createPortfolioResponse(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req.params;
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        firstName: {
          equals: username,
          mode: "insensitive",
        },
      },
      include: {
        portfolio: true,
        skills: true,
        experience: true,
        education: true,
        projects: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const portfolio = await getOrCreatePortfolio(user);

    const response = await prisma.portfolioResponse.create({
      data: {
        portfolioId: portfolio.id,
        name,
        email,
        message,
      },
    });

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

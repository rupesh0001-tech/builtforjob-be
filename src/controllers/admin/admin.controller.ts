import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';
import { comparePassword, hashPassword } from '../../services/hash/hash.service';
import { generateToken } from '../../services/jwt/jwt.service';

// Admin Login
export async function adminLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = generateToken({ adminId: admin.id, email: admin.email });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // HIGH-02: Token is transmitted via httpOnly cookie only — never expose it in the response body
    return res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name
        }
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get current admin info (used for session restore on page load)
export async function getAdminMe(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = (req as any).admin as { id: string; email: string; name: string } | undefined;
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    return res.json({
      success: true,
      data: { admin },
    });
  } catch (error) {
    next(error);
  }
}

// Get Overview Stats
export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const [
      totalUsers,
      proUsers,
      bannedUsers,
      totalResumes,
      totalPortfolios,
      tokenAgg,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: 'PRO' } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.resume.count(),
      prisma.portfolio.count(),
      prisma.user.aggregate({
        _sum: {
          tokens: true
        }
      })
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        proUsers,
        bannedUsers,
        totalResumes,
        totalPortfolios,
        totalTokens: tokenAgg._sum.tokens || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

// Get List of Users
export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const plan = (req.query.plan as string) || '';
    const status = (req.query.status as string) || '';
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const skip = (page - 1) * limit;

    // Build Prisma query condition
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Plan filter
    if (plan === 'PRO' || plan === 'FREE') {
      where.plan = plan;
    }

    // Status filter
    if (status === 'banned') {
      where.isBanned = true;
    } else if (status === 'active') {
      where.isBanned = false;
    }

    // Sorting
    let orderBy: any = {};
    if (sortBy === 'name') {
      orderBy = { firstName: sortOrder };
    } else if (sortBy === 'tokens') {
      orderBy = { tokens: sortOrder };
    } else if (sortBy === 'plan') {
      orderBy = { plan: sortOrder };
    } else {
      orderBy = { createdAt: sortOrder };
    }

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          bio: true,
          location: true,
          jobTitle: true,
          isVerified: true,
          tokens: true,
          plan: true,
          isBanned: true,
          bannedUntil: true,
          banReason: true,
          createdAt: true,
        }
      }),
      prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

// Create a User
export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName, jobTitle, tokens, plan } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        jobTitle: jobTitle || null,
        tokens: tokens !== undefined ? parseFloat(tokens) : 5.0,
        plan: plan === 'PRO' ? 'PRO' : 'FREE',
        isVerified: true // Admin-created accounts are auto-verified
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        plan: true,
        tokens: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    next(error);
  }
}

// Update User Details
export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, bio, location, jobTitle } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify email unique if changing
    if (email && email !== existingUser.email) {
      const emailDup = await prisma.user.findUnique({ where: { email } });
      if (emailDup) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName !== undefined ? firstName : existingUser.firstName,
        lastName: lastName !== undefined ? lastName : existingUser.lastName,
        email: email !== undefined ? email : existingUser.email,
        phone: phone !== undefined ? phone : existingUser.phone,
        bio: bio !== undefined ? bio : existingUser.bio,
        location: location !== undefined ? location : existingUser.location,
        jobTitle: jobTitle !== undefined ? jobTitle : existingUser.jobTitle,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        location: true,
        jobTitle: true,
      }
    });

    return res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

// Update User Plan
export async function updateUserPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    if (plan !== 'FREE' && plan !== 'PRO') {
      return res.status(400).json({ success: false, message: 'Invalid plan type' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { plan },
      select: { id: true, email: true, plan: true }
    });

    return res.json({
      success: true,
      message: `User plan updated to ${plan} successfully`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

// Update User Tokens
export async function updateUserTokens(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { tokens } = req.body;

    if (tokens === undefined || isNaN(parseFloat(tokens))) {
      return res.status(400).json({ success: false, message: 'Invalid tokens value' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { tokens: parseFloat(tokens) },
      select: { id: true, email: true, tokens: true }
    });

    return res.json({
      success: true,
      message: 'User tokens updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

// Ban / Unban User
export async function updateUserBan(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { isBanned, days, reason } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let bannedUntil: Date | null = null;
    if (isBanned) {
      if (days && !isNaN(parseInt(days))) {
        bannedUntil = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isBanned: !!isBanned,
        bannedUntil: isBanned ? bannedUntil : null,
        banReason: isBanned ? (reason || null) : null
      },
      select: {
        id: true,
        email: true,
        isBanned: true,
        bannedUntil: true,
        banReason: true
      }
    });

    return res.json({
      success: true,
      message: isBanned ? 'User banned successfully' : 'User unbanned successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function getReports(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const reports = await prisma.atsReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
}

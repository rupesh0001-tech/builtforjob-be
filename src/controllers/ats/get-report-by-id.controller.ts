import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function getReportById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const report = await prisma.atsReport.findFirst({
      where: { id, userId },
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

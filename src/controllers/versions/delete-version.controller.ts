import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function deleteVersion(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Version ID is required" });
    }

    const version = await prisma.applicationVersion.findFirst({
      where: { id, userId },
    });

    if (!version) {
      return res.status(404).json({ message: "Version not found or unauthorized" });
    }

    await prisma.applicationVersion.delete({
      where: { id },
    });

    return res.json({ message: "Version deleted successfully" });
  } catch (error) {
    next(error);
  }
}

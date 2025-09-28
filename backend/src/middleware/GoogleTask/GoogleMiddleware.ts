import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prismaClient";

export const requireBusinessDeveloper = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID" });
    }

    const profile = await prisma.profiles.findUnique({
      where: { user_id: userId },
      select: { designation: true },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (profile.designation !== "Business Development") {
      // Skip automation but allow route execution
      req.isBusinessDeveloper = false; // you can attach a flag to req
    } else {
      req.isBusinessDeveloper = true;
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: "Role check failed", err });
  }
};
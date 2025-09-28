import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prismaClient";
import { AssignLead } from "../../utils/TelleCaller/TelleFunction";

export const AssignLeadToBussinessDeveloper = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { leadId } = req.params;

  const userId: any = req.user?.user_id;

  try {
    const data = await AssignLead(leadId, userId);
    res.status(200).json({ message: "The lead is assigned" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

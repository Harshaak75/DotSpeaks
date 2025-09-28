import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prismaClient";
import env from "dotenv";

env.config();

export const GetContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientId = req.user?.user_id;

    const data = await prisma.marketingContent.findMany({
      where: {
        clientId: clientId,
      },
      select: {
        id: true,
        clientId: true,
        title: true,
        content: true,
        date: true,
        hashtags: true,
        status: true,
        reworkCount: true
      },
    });

    console.log("Data: ", data);
    res.status(200).json({ content: data });
  } catch (error) {
    console.error("Error fetching content: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const rework_counts: any = process.env.REWORK_LIMIT;

    if(!rework_counts){
        res.status(500).json({message: "Rework Count not found"})
    }

    console.log(id, comment);

    // First, find the content to check its current rework count
    const content = await prisma.marketingContent.findUnique({
      where: { id: id },
      select: { reworkCount: true },
    });

    if (!content) {
      return res.status(404).json({ error: "Content not found." });
    }

    // SERVER-SIDE VALIDATION: Check if the limit has been reached
    if (content.reworkCount >= rework_counts) {
      return res.status(403).json({ error: "Rework limit has been reached for this content." });
    }

    await prisma.marketingContent.update({
      where: {
        id: id,
      },
      data: {
        reworkComment: comment,
        status: "rework_requested",
        reworkCount:{
            increment: 1
        }
      },
    });
    res.status(200).json({ message: "Updated the data" });
  } catch (error) {
    res.status(500).json({ message: "Error in adding the comment", error });
  }
};

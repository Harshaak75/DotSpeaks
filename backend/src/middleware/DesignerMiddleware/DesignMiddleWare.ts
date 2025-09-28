import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import supabase from "../../config/supabase";
import prisma from "../../lib/prismaClient";

// Configure multer to store files in memory as buffers
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const uploadDesign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?.user_id;
    const file = req.file; // The file is available here thanks to multer
    const { taskId } = req.body;

    if (!file || !userId || !taskId) {
      return res.status(400).json({
        error: "Missing file, user authentication, or task ID.",
      });
    }

    const filePath = `${userId}/${taskId}/${Date.now()}-${file.originalname}`;
    console.log("FileType: ", file.mimetype);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("designer-uploads") // 👈 Replace with your bucket name
      .upload(filePath, file.buffer, {
        contentType: file.mimetype, // Set the correct MIME type
        upsert: false, // Set to true if you want to allow overwriting files
      });

    if (uploadError) {
      // If the upload fails, throw an error
      throw uploadError;
    }

    console.log(uploadData);

    const newSubmission = await prisma.designerSubmission.create({
      data: {
        filePath: uploadData.path, // The path returned by Supabase
        fileName: file.originalname,
        fileType: file.mimetype,
        taskId: taskId,
        designerId: userId,
      },
    });

    // update the file status in the marketContent table

    await prisma.marketingContent.update({
      where: {
        id: taskId,
      },
      data: {
        fileStatus: "UPLOADED",
      },
    });

    res.status(201).json({
      message: "File uploaded and submission created successfully.",
      submission: newSubmission,
    });
  } catch (error: any) {
    console.error("Error during file upload:", error);

    // Send a more informative error message back to the frontend
    res.status(500).json({
      error: "An unexpected error occurred.",
      // Include the specific error message for easier debugging
      details: error.message,
    });
  }
};

export const RequestHelp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const requesterId = req.user?.user_id; // Designer's user ID
    const { taskId, message } = req.body;
    if (!taskId || !message) {
      return res
        .status(400)
        .json({ message: "Task ID and a message are required." });
    }

    if (!requesterId) {
      return res
        .status(401)
        .json({ message: "Authentication failed: User ID not found." });
    }

    const designerTeamMember = await prisma.teamMember.findFirst({
      where: {
        profile: { user_id: requesterId },
        team: {
          clients: { some: { MarketingContent: { some: { id: taskId } } } },
        },
      },
      include: {
        team: {
          select: { brandHeadId: true },
        },
      },
    });

    if (!designerTeamMember) {
      return res
        .status(403)
        .json({ message: "Access denied: You are not assigned to this task." });
    }

    // 2️⃣ GET THE BRAND HEAD'S USER ID
    // Find the user_id associated with the brand head's profile ID.
    // We do this BEFORE the transaction so we can use it in both steps.
    const brandHeadProfileId = designerTeamMember.team.brandHeadId;
    const brandHeadUser = await prisma.profiles.findUnique({
      where: { id: brandHeadProfileId },
      select: { user_id: true },
    });

    // This is the ID we need to save and send notifications to.
    const brandHeadUserId = brandHeadUser?.user_id;

    if (!brandHeadUserId) {
      // This case handles if a team is misconfigured without a valid Brand Head
      return res
        .status(500)
        .json({ message: "Could not find a Brand Head for this team." });
    }

    // 3️⃣ DATABASE TRANSACTION
    const [newTicket, updatedTask] = await prisma.$transaction([
      prisma.helpTicket.create({
        data: {
          message,
          taskId,
          requesterId,
          status: "OPEN",
          // ✅ CORRECTED: Assign the ticket to the Brand Head immediately
          resolverId: brandHeadUserId,
        },
      }),
      prisma.marketingContent.update({
        where: { id: taskId },
        data: { status: "Help_requested" },
      }),
    ]);

    // 4️⃣ NOTIFY THE BRAND HEAD IN REAL-TIME
    const privateChannelName = `private-notifications-${brandHeadUserId}`;
    const userChannel = supabase.channel(privateChannelName);

    await userChannel.send({
      type: "broadcast",
      event: "new_help_ticket",
      payload: {
        message: `A new help ticket has been raised by a designer.`,
        ticket: newTicket,
      },
    });

    console.log(
      `📢 Notification sent to Brand Head on channel: ${privateChannelName}`
    );

    res.status(201).json({
      message: "Help request submitted successfully.",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating help ticket:", error);
    res.status(500).json({ message: "Failed to submit help request." });
  }
};

import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prismaClient";
import env from "dotenv";
import supabase from "../../config/supabase";

env.config();

export const GetContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientId = req.user?.user_id;

    // 1. Fetch the full data, including potential submission info, in one go.
    const fullData = await prisma.marketingContent.findMany({
      where: {
        clientId: clientId,
      },
      include: {
        DesignerSubmission: true, // Always include this
      },
    });

    // 2. Perform the check
    const allItemsAreApproved = fullData.every(
      (item) => item.status === "DM_APPROVED"
    );
    console.log(`Are all items DM_APPROVED? ${allItemsAreApproved}`);

    let responseData;

    // 3. IF TRUE: All items are approved, so generate image URLs
    if (allItemsAreApproved && fullData.length > 0) {
      console.log("All items approved. Processing with image URLs...");
      responseData = await Promise.all(
        fullData.map(async (content) => {
          let imageUrls: any[] = [];
          if (content.DesignerSubmission && content.DesignerSubmission.length > 0) {
            imageUrls = await Promise.all(
              content.DesignerSubmission.map(async (submission) => {
                const { data, error } = await supabase.storage
                  .from("designer-uploads")
                  .createSignedUrl(submission.filePath, 3600);
                return error ? null : data.signedUrl;
              })
            );
          }
          return {
            ...content,
            imageUrls: imageUrls.filter((url) => url !== null),
          };
        })
      );
    } 
    // 4. ELSE: Not all are approved, so shape the data to send only the basic fields
    else {
      console.log("Not all items approved. Sending limited data shape...");
      responseData = fullData.map((content) => {
        // Create a new object with ONLY the fields you want
        return {
          id: content.id,
          clientId: content.clientId,
          title: content.title,
          content: content.content,
          date: content.date,
          hashtags: content.hashtags,
          status: content.status,
          reworkCount: content.reworkCount,
          // Note: imageUrls and DesignerSubmission are intentionally left out
        };
      });
    }

    res.status(200).json({ content: responseData });

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

    if (!rework_counts) {
      res.status(500).json({ message: "Rework Count not found" });
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
      return res
        .status(403)
        .json({ error: "Rework limit has been reached for this content." });
    }

    await prisma.marketingContent.update({
      where: {
        id: id,
      },
      data: {
        reworkComment: comment,
        status: "rework_requested",
        reworkCount: {
          increment: 1,
        },
      },
    });
    res.status(200).json({ message: "Updated the data" });
  } catch (error) {
    res.status(500).json({ message: "Error in adding the comment", error });
  }
};

export const GetTheDesign = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clientId = req.user?.user_id;

  try {
    const contentForClient = await prisma.marketingContent.findMany({
      where: { clientId: clientId, status: "DM_APPROVED" }, // Or whatever logic you use
      include: {
        // Eager load the submissions to get their file paths
        DesignerSubmission: true,
      },
    });

    const contentWithImageUrls = await Promise.all(
      contentForClient.map(async (content) => {
        const imageUrls = await Promise.all(
          content.DesignerSubmission.map(async (submission) => {
            const { data, error } = await supabase.storage
              .from("designer-uploads") // Your bucket name
              .createSignedUrl(submission.filePath, 3600); // 3600 seconds = 1 hour validity

            if (error) {
              console.error("Error creating signed URL:", error);
              return null;
            }
            return data.signedUrl;
          })
        );

        // Return the content object with the new `imageUrls` array
        return {
          ...content,
          imageUrls: imageUrls.filter((url) => url !== null), // Filter out any nulls from errors
        };
      })
    );

    res.status(200).json({ content: contentWithImageUrls });
  } catch (error) {
    console.error("Error fetching designs for client:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

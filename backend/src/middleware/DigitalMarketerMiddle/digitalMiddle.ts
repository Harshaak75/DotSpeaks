import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prismaClient";
import supabase from "../../config/supabase";

export const GetDataOfGf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestingUserId = req.user?.user_id;

    if (!requestingUserId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // 1️⃣ Find all team IDs for the requesting user
    const userTeamIds = await prisma.teamMember.findMany({
      where: {
        profile: {
          user_id: requestingUserId,
        },
      },
      select: {
        teamId: true,
      },
    });

    const teamIds = userTeamIds.map((t) => t.teamId);

    if (teamIds.length === 0) {
      return res.status(200).json([]); // No teams found, so no content to return
    }

    // 2️⃣ Find all MarketingContent tasks where the client's teamId is one of the user's team IDs
    const tasks = await prisma.marketingContent.findMany({
      where: {
        clients: {
          // Filter tasks by clients that belong to the user's teams
          teamId: {
            in: teamIds,
          },
        },
        DesignerSubmission: {
          some: {
            designer: {
              profile: {
                TeamMember: {
                  some: {
                    // Filter submissions by designers on the same teams
                    teamId: {
                      in: teamIds,
                    },
                    role: "Graphic Designer",
                  },
                },
              },
            },
          },
        },
        status: {
          notIn: ["DM_APPROVED", "READY_FOR_CLIENT"],
        },
      },
      include: {
        DesignerSubmission: {
          include: {
            designer: {
              include: {
                profile: {
                  select: { name: true },
                },
              },
            },
          },
        },
        clients: {
          select: { company_name: true, id: true },
        },
      },
      orderBy: { date: "asc" },
    });

    if (!tasks || tasks.length === 0) {
      return res.status(200).json([]);
    }

    // 3️⃣ Attach signed URLs (as in your original code)
    // ... (Your existing logic for creating signed URLs) ...

    const tasksWithUrls = await Promise.all(
      tasks.map(async (task) => {
        const submissions = await Promise.all(
          task.DesignerSubmission.map(async (submission) => {
            const { data, error } = await supabase.storage
              .from("designer-uploads")
              .createSignedUrl(submission.filePath, 3600);

            if (error) {
              console.error(
                `Failed to create signed URL for submission ${submission.id}:`,
                error.message
              );
              return null;
            }

            return {
              id: submission.id,
              fileName: submission.fileName,
              fileType: submission.fileType,
              uploadedBy: submission.designer.profile?.name,
              imageUrl: data.signedUrl,
              createdAt: submission.createdAt,
            };
          })
        );

        return {
          taskDetails: {
            id: task.id,
            campaignTitle: task.campaignTitle,
            date: task.date,
            marketerGuide: task.content,
            hashtags: task.hashtags,
            postType: task.postType,
            platform: task.platform,
            clientId: task.clients?.id,
            clientName: task.clients?.company_name,
            status: task.status,
          },
          designerSubmissions: submissions.filter((s) => s !== null),
        };
      })
    );

    return res.status(200).json(tasksWithUrls);
  } catch (error) {
    console.error("Error fetching Graphic Designer submissions:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const ApprovalTheDesign = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required." });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark the current task as DM_APPROVED
      const approvedTask = await tx.marketingContent.update({
        where: { id: taskId },
        data: { status: "DM_APPROVED" },
      });

      const parentContentId = approvedTask.contentId;

      // 2. Check if there are any OTHER tasks in the same batch that are NOT approved
      const remainingTasksCount = await tx.marketingContent.count({
        where: {
          contentId: parentContentId,
          NOT: {
            status: "DM_APPROVED",
          },
        },
      });

      if (remainingTasksCount === 0) {
        const readyContent = await tx.content.update({
          where: { id: parentContentId },
          data: { status: "READY_FOR_CLIENT" },
          include: {
            // Include the client to get their team and name
            client: true,
          },
        });
        // TODO: Send a notification to the client that their content is ready for review
        if (readyContent.clientId) {
          // The channel name is based on the client's ID
          const privateChannelName = `private-client-notifications-${readyContent.clientId}`;

          const payload = {
            event: "content_ready_for_your_review",
            message: `Your new content, "${readyContent.title}", is ready for review!`,
            contentId: readyContent.id,
            clientName: readyContent.client?.company_name,
          };

          console.log(
            `📢 Broadcasting to CLIENT channel ${privateChannelName}`
          );

          // Send the broadcast
          await supabase.channel(privateChannelName).send({
            type: "broadcast",
            event: payload.event,
            payload: payload,
          });
        }
        return { allTasksCompleted: true };
      }

      return { allTasksCompleted: false };
    });

    res.status(200).json({
      message: "Task approved successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Error approving task:", error);
    res.status(500).json({ message: "Failed to approve task." });
  }
};

export const RequestRework = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { taskId, comment } = req.body;
    const digitalMarketerUserId = req.user?.user_id;

    if (!taskId || !comment) {
      return res
        .status(400)
        .json({ message: "Task ID and a comment are required." });
    }

    const task = await prisma.marketingContent.findFirst({
      where: {
        id: taskId,
        clients: {
          Team: {
            members: { some: { profile: { user_id: digitalMarketerUserId } } },
          },
        },
      },
    });

    if (!task) {
      return res
        .status(403)
        .json({ message: "Access denied or task not found." });
    }

    // --- UPDATE THE TASK ---
    const updatedTask = await prisma.marketingContent.update({
      where: { id: taskId },
      data: {
        status: "rework_requested",
        reworkComment: comment,
      },
    });
    res
      .status(200)
      .json({ message: "Rework requested successfully.", task: updatedTask });
  } catch (error) {
    console.error("Error requesting rework:", error);
    res.status(500).json({ message: "Failed to request rework." });
  }
};

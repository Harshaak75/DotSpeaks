import express from "express";
const router = express.Router();
import supabase from "../config/supabase";
import prisma from "../lib/prismaClient";
import { authenticate_user } from "../middleware/authMiddleware";
import {
  ClientDetails,
  CreateClientAccountFromBrandHead,
  CreateTeam,
  FetchCardDetails,
} from "../middleware/BrandHeadMiddleware/BHMiddleware";
import { CreateClientAccount } from "../controller/BrandDeveloper/CreateClientAccount";

router.get("/profile", authenticate_user, async (req, res) => {
  try {
    const profile = await prisma.profiles.findUnique({
      where: { user_id: req.user?.user_id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const Package = await prisma.brandHeadPackageAssignments.findFirst({
      where: {
        profile_id: profile.id,
      },
      select: {
        Package: true,
      },
    });

    let PackageName;

    if (Package) {
      PackageName = Package.Package?.name;
    }

    res.status(200).json({ profile, PackageName });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.get(
  "/employeesDetails/:PackageName",
  authenticate_user,
  async (req, res) => {
    const { PackageName } = req.params;

    try {
      const packageData = await prisma.package.findUnique({
        where: {
          name: PackageName,
        },
        select: {
          id: true,
        },
      });

      if (!packageData) {
        return res.status(404).json({ error: "Package not found" });
      }

      const thresholds = await prisma.roleAssignmentThreshold.findMany({
        where: {
          role: {
            in: ["Graphic Designer", "Digital Marketer", "Content Writer"],
          },
        },
      });

      // Convert the array to an easier-to-use object, like:
      // { 'Graphic Designer': 10, 'Digital Marketer': 10, 'Content Writer': 30 }
      const thresholdMap = thresholds.reduce((acc: any, curr: any) => {
        acc[curr.role] = curr.max_clients;
        return acc;
      }, {});

      const allCandidates = await prisma.packageEmployee.findMany({
        where: {
          packageId: packageData.id,
          profile: {
            designation: {
              in: ["Graphic Designer", "Digital Marketer", "Content Writer"],
            },
          },
        },
        include: {
          profile: {
            include: {
              _count: {
                select: {
                  EmployeeClientAssignment: true,
                },
              },
            },
          },
        },
      });

      if (!allCandidates) {
        return res
          .status(404)
          .json({ error: "No employees found for this package" });
      }

      // 2. Filter the results in your application and group them by role
      const availableEmployees: any = {
        graphicDesigners: [],
        digitalMarketers: [],
        contentWriters: [],
      };

      for (const candidate of allCandidates) {
        const role = candidate.profile.designation;
        const currentClientCount =
          candidate.profile._count.EmployeeClientAssignment;
        const maxClientsForRole = thresholdMap[role];

        // Check if the employee has capacity
        if (currentClientCount <= maxClientsForRole) {
          if (role === "Graphic Designer") {
            availableEmployees.graphicDesigners.push(candidate.profile);
          } else if (role === "Digital Marketer") {
            availableEmployees.digitalMarketers.push(candidate.profile);
          } else if (role === "Content Writer") {
            availableEmployees.contentWriters.push(candidate.profile);
          }
        }
      }

      res.status(200).json(availableEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  }
);

router.get("/clientDetails", authenticate_user, ClientDetails);

router.post("/createTeam/:packageName", authenticate_user, CreateTeam);

router.get("/fetchCard", authenticate_user, FetchCardDetails);

router.get("/open-tickets", authenticate_user, async (req, res) => {
  const brandHeadUserId = req.user?.user_id;

  if (!brandHeadUserId) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const tickets = await prisma.helpTicket.findMany({
      where: {
        resolverId: brandHeadUserId,
        status: "OPEN",
      },
      include: {
        // Include the requester's name from their profile
        requester: {
          include: {
            profile: {
              select: { name: true, designation: true },
            },
          },
        },
        // Include the task title and the client's name
        task: {
          select: {
            campaignTitle: true,
            id: true,
            date: true,
            content: true, // marketerGuide
            hashtags: true,
            objective: true,
            visual: true,
            headline: true,
            message: true,
            cta: true,
            branding: true,
            clients: {
              select: { company_name: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc", // Show the oldest tickets first
      },
    });

    // Format the data into a cleaner structure for the frontend
    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      from: ticket.requester.profile?.name || "Unknown User",
      role: ticket.requester.profile?.designation || "Unknown Role",
      task: ticket.task.campaignTitle,
      client: ticket.task.clients?.company_name || "Unknown Client",
      details: ticket.message, // The actual help request comment
      taskDetails: ticket.task,
    }));

    res.status(200).json(formattedTickets);
  } catch (error) {
    console.error("Error fetching open tickets for Brand Head:", error);
    res.status(500).json({ message: "Failed to fetch tickets." });
  }
});

router.post("/resolve-ticket", authenticate_user, async (req, res) => {
  const resolverId = req.user?.user_id; // Brand Head's user ID from middleware
  const { ticketId, response } = req.body;

  if (!ticketId || !response) {
    return res
      .status(400)
      .json({ message: "Ticket ID and a response are required." });
  }

  try {
    // --- AUTHORIZATION ---
    // Find the ticket and verify the person resolving it is the assigned Brand Head.
    const ticket = await prisma.helpTicket.findFirst({
      where: {
        id: ticketId,
        resolverId: resolverId, // Ensures only the assigned resolver can close it
        status: "OPEN",
      },
    });

    if (!ticket) {
      return res.status(403).json({
        message:
          "Access denied: Ticket not found or you are not authorized to resolve it.",
      });
    }

    // --- DATABASE TRANSACTION ---
    // Update the ticket and the original marketing task in one atomic operation.
    const [updatedTicket, updatedTask] = await prisma.$transaction([
      // 1. Update the HelpTicket
      prisma.helpTicket.update({
        where: { id: ticketId },
        data: {
          response,
          status: "RESOLVED",
          resolvedAt: new Date(),
        },
      }),
      // 2. Update the MarketingContent status back to 'rework' or 'pending_review'
      // This "unblocks" the task for the designer.
      prisma.marketingContent.update({
        where: { id: ticket.taskId },
        data: {
          status: "rework_requested", // Or 'pending_review', depending on your workflow
        },
      }),
    ]);

    // 3️⃣ NOTIFY THE ORIGINAL REQUESTER (DESIGNER) IN REAL-TIME
    const requesterId = ticket.requesterId;
    const privateChannelName = `private-notifications-${requesterId}`;
    const userChannel = supabase.channel(privateChannelName);

    await userChannel.send({
      type: "broadcast",
      event: "ticket_resolved", // A new event for the designer's frontend
      payload: {
        message: `Your help ticket for task has been resolved by the Brand Head.`,
        ticket: updatedTicket,
      },
    });

    console.log(
      `📢 Response notification sent to Designer on channel: ${privateChannelName}`
    );

    res.status(200).json({
      message: "Ticket resolved successfully.",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error resolving ticket:", error);
    res.status(500).json({ message: "Failed to resolve ticket." });
  }
});

router.post(
  "/Create-Client-Account",
  authenticate_user,
  CreateClientAccountFromBrandHead
);

export default router;

import express from "express";
const router = express.Router();
import supabase from "../config/supabase";
import prisma from "../lib/prismaClient";
import { authenticate_user } from "../middleware/authMiddleware";
import { AssignLeadToBussinessDeveloper } from "../middleware/TellecallerMiddleware/TCmiddleware";

router.get("/getInfo", authenticate_user, async (req, res) => {
  try {
    const telecommunicatorId = req.user?.user_id;

    if (!telecommunicatorId) {
      return res
        .status(401)
        .json({ message: "Authentication error: User ID not found." });
    }

    // --- THIS IS THE FIX ---
    // Use a 'where' clause to find only the leads assigned
    // to the currently logged-in user.
    const allLeads = await prisma.telecommunicatorLeads.findMany({
      where: {
        assignedToId: telecommunicatorId,
        status: {not: "Forwarded"}
      },
    });

    res.status(200).json(allLeads);
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    res.status(500).json({ message: "Error fetching leads" });
  }
});

// to assign the client

// async function createNewLead(leadData: any) {
//     // 1. Get a list of all available telecommunicators
//     const telecommunicators = await prisma.users.findMany({
//         where: { role: 'Telecommunicator' }
//     });

//     if (telecommunicators.length === 0) {
//         throw new Error("No telecommunicators available to assign leads to.");
//     }

//     // 2. Find the ID of the user who received the last lead
//     const lastLead = await prisma.telecommunicatorLeads.findFirst({
//         orderBy: { created_at: 'desc' } // Order by creation date to find the last one
//     });

//     let nextAssigneeId;

//     if (lastLead && lastLead.assignedToId) {
//         // Find the index of the last person and get the next one
//         const lastAssigneeIndex = telecommunicators.findIndex(t => t.id === lastLead.assignedToId);
//         const nextIndex = (lastAssigneeIndex + 1) % telecommunicators.length; // The '%' makes it circle back
//         nextAssigneeId = telecommunicators[nextIndex].id;
//     } else {
//         // If there are no previous leads, assign it to the first person
//         nextAssigneeId = telecommunicators[0].id;
//     }

//     // 3. Create the new lead with the assigned user ID
//     const newLead = await prisma.telecommunicatorLeads.create({
//         data: {
//             ...leadData,
//             assignedToId: nextAssigneeId // Assign the lead to the next person in line
//         }
//     });

//     return newLead;
// }

// change status

router.post("/changeStatus/:id", authenticate_user, async (req, res) => {
  try {
    const { id } = req.params;

    // 2. Destructure 'status' from req.body
    const { status } = req.body;

    console.log(id, status);

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    await prisma.telecommunicatorLeads.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });
    res.status(200).json({ message: "done" });
  } catch (error: any) {
    res.status(500).json({ error });
  }
});

router.post("/SendToBussinessDeveloper/:leadId",authenticate_user,AssignLeadToBussinessDeveloper)

export default router;

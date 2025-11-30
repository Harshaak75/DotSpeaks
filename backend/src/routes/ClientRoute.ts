import express from "express";
import { authenticate_user } from "../middleware/authMiddleware";
import {
  addComment,
  GetContent,
  GetTeamMembers,
  GetTheDesign,
} from "../controller/ClientFunction/ClientMiddleware";
import prisma from "../lib/prismaClient";

const router = express.Router();

router.get("/content", authenticate_user, GetContent);
router.get("/myClientId", authenticate_user, (req, res) => {
  try {
    const clientId = req.user?.user_id;
    res.status(200).json({ clientId });
  } catch (error) {
    console.error("Error fetching client ID: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/addComment/:id", authenticate_user, addComment);

router.put("/approval/:id", authenticate_user, async (req, res) => {
  try {
    const { id } = req.params;

    const updatedItem = await prisma.marketingContent.update({
      where: {
        id: id,
      },
      data: {
        status: "approved",
      },
    });

    // 2. After updating, get all sibling items belonging to the same parent Content
    const allSiblings = await prisma.marketingContent.findMany({
      where: { contentId: updatedItem.contentId },
      select: { status: true },
    });

    // 3. Check if EVERY single sibling item is now approved
    const allApproved = allSiblings.every(
      (item) => item.status === 'approved'
    );

    // 4. If all are approved, update the parent Content's status
    if (allApproved) {
      await prisma.content.update({
        where: { id: updatedItem.contentId },
        data: { status: "approved" },
      });
      console.log(`Parent Content ${updatedItem.contentId} is now fully approved!`);
      // This is where you would also trigger the notification to the graphic designer.
    }

    
    res.status(200).json({ message: "Status is approved" });
  } catch (error) {
    res.status(500).json({ message: "Status is not approved", error: error });
  }
});

router.get("/contentDesign", authenticate_user, GetTheDesign)

router.get("/GetTeamMembers", authenticate_user, GetTeamMembers);


// profile
router.get("/getClientDetails", authenticate_user, async (req, res) =>{
  try {
    const clientId = req.user?.user_id;

    const clientData: any = await prisma.clientOnboardingData.findUnique({
      where:{
        clientId: clientId
      }
    })

    if(!clientData){
      return res.status(404).json({message: "Client data not found"});
    }

    const {id, ...rest} = clientData;
    res.status(200).json(rest);
  } catch (error) {
    res.status(500).json({message: "Error fetching client details", error: error});
  }
})

router.get("/billind_and_subscription", authenticate_user, async (req, res) =>{
  try {
    const clientId = req.user?.user_id;

    const bilingData = await prisma.clientSubscription.findFirst({
      where:{
        clientId: clientId,
        status: "ACTIVE"
      },
      include:{
        billingHistories: true
      }
    })
    res.status(200).json(bilingData);
  } catch (error) {
    res.status(500).json({message: "Error fetching billing and subscription details", error: error});
  }
})
export default router;

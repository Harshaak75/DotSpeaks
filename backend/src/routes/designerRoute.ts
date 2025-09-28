import express from "express";
const router = express.Router();
import supabase from "../config/supabase";
import { authenticate_user } from "../middleware/authMiddleware";
import prisma from "../lib/prismaClient";
import { RequestHelp, uploadDesign } from "../middleware/DesignerMiddleware/DesignMiddleWare";
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/getContent", authenticate_user, async (req, res) => {
  try {
    const userId = req.user?.user_id;
    // Fetch clients assigned to the user and include their MarketingContent
const clientData = await prisma.clients.findMany({
      where: {
        Team: {
          members: {
            some: {
              profile: {
                user_id: userId,
              },
            },
          },
        },
        // ✅ REMOVED the problematic filter block below
        /*
        Content:{
          every:{
            status: "approved"
          }
        }
        */
      },
      select: {
        id: true,
        company_name: true,
        MarketingContent: {
          // You can add more specific 'where' clauses here if needed,
          // for example, to only fetch tasks with certain statuses.
          orderBy: {
            date: "asc",
          },
          include: {
            HelpTicket: true,
          },
        },
      },
    });
    res.status(200).json(clientData);
  } catch (error) {
    res.status(500).json({ message: "Cannot get the content", error: error });
  }
});

router.post("/submission/upload", authenticate_user,upload.single('file'), uploadDesign)

router.get("/getUserId", authenticate_user, async (req, res) =>{
  try {
    const user_id = req.user?.user_id;

    res.status(200).json({ user_id });
  } catch (error) {
    res.status(500).json({ message: "Cannot get user ID", error: error });
  }
})

router.post("/request-help", authenticate_user, RequestHelp);

export default router;

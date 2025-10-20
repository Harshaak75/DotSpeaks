import express from "express";
const router = express.Router();
import supabase from "../config/supabase";
import { authenticate_user } from "../middleware/authMiddleware";
import {
  addTargets,
  CmoTargets,
  UploadLeads,
} from "../middleware/CMOMiddleware/cmoMiddleWare";
import prisma from "../lib/prismaClient";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

router.post("/addCMOTargets", authenticate_user, addTargets);
router.get("/sendTarget/:quarter", authenticate_user, CmoTargets);
router.get("/getQuarter", authenticate_user, async (req, res) => {
  try {
    const latestCMOTarget = await prisma.broadcastLog.findFirst({
      where: { type: "target_for_cmo" },
      orderBy: [
        { version: "desc" }, // Highest version first
        { createdAt: "desc" }, // Most recent timestamp first
      ],
    });

    if (!latestCMOTarget) {
      return res.status(404).json({ message: "No broadcast found" });
    }

    return res.status(200).json(latestCMOTarget);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
});

router.post(
  "/UploadLeads",
  authenticate_user,
  upload.single("file"),
  UploadLeads
);

export default router;

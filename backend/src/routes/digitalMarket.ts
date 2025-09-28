import { authenticate_user } from "../middleware/authMiddleware";
import prisma from "../lib/prismaClient";
import express from "express";
import { ApprovalTheDesign, GetDataOfGf, RequestRework } from "../middleware/DigitalMarketerMiddle/digitalMiddle";
const router = express.Router();

router.get("/getInfoOfGF", authenticate_user, GetDataOfGf)

router.post("/approval-design", authenticate_user, ApprovalTheDesign)

router.post("/request-rework", authenticate_user, RequestRework)

export default router;
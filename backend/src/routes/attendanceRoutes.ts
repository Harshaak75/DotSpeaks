import express from "express";
import { authenticate_user } from "../middleware/authMiddleware";
import { End_Break, Start_Break } from "../controller/attendanceController";

const router = express.Router();

router.post("/start-break", authenticate_user, Start_Break);

router.post("/end-break/:break_id", authenticate_user, End_Break);

export default router;

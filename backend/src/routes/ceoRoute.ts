import express from "express";
const router = express.Router();
import supabase from "../config/supabase";
import { authenticate_user } from "../middleware/authMiddleware";
import { setTargets } from "../controller/CEO/CEOMiddleware";

router.post("/setTarget", authenticate_user, setTargets)

export default router;
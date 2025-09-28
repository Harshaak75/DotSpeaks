import express from "express";
import { authenticate_user } from "../middleware/authMiddleware";
import { HashingFunction } from "../utils/authUtils/authFunction";
import { CreateClientAccount, GetInfo, GetTellerCallerLeadInfo, ScheduleMeet } from "../controller/BrandDeveloper/CreateClientAccount";

const router = express.Router();

// register Client

router.post("/CreateClientAccount",authenticate_user, CreateClientAccount);

router.get("/Getinfo", authenticate_user,GetInfo)

router.get("/GetTellerCallerLeadInfo/:id", authenticate_user, GetTellerCallerLeadInfo)

router.post("/ScheduleMeet/:id", authenticate_user, ScheduleMeet)

export default router;
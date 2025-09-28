import express from "express";
import { authenticate_user } from "../middleware/authMiddleware";
import { GetClient, updateContent, UploadDocument } from "../controller/ContentWriter/ContentWriter";
import multer from "multer";

const upload = multer({storage: multer.memoryStorage()});

const router = express.Router();

router.get("/clients", authenticate_user, GetClient)

router.post("/uploadDocument", authenticate_user,upload.single('file'), UploadDocument)

router.put("/updateContent/:id", authenticate_user, updateContent)

export default router;
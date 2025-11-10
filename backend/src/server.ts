import express from "express";
import cors from "cors";
import env from "dotenv";
import cooRoutes from "./routes/coo";
import authRoutes from "./routes/auth";

import attendance from "./routes/attendanceRoutes";

import brandDeveloper from "./routes/brandDeveloper";

import telleCaller from "./routes/telleCaller";

import googleAuth from "./routes/googleAuthRoutes";

import BrandHead from "./routes/BrandHeadRoutes";

import ChattingSystem from "./routes/charttingRoutes";

import contentWriter from "./routes/ContentWriter";

import clientRoute from "./routes/ClientRoute";

import designerRoute from "./routes/designerRoute";

import digitalMarket from "./routes/digitalMarket";

import cmoRoutes from "./routes/cmo";

import ceoRoute from "./routes/ceoRoute";

import cookieParser from "cookie-parser";

import http from "http"; // <-- Add this
import { Server } from "socket.io"; // <-- Add this

import { ListenNewClient } from "./services/ClientBackground/NewClient";
import { listenForLeadChanges } from "./services/TelleCallerBackGround/TriggerStatus";
import { listenForBusinessDeveloperChanges } from "./services/BusinessDeveloperTrigger/BDTrigger";
import prisma from "./lib/prismaClient";
import { initializeSocket } from "./lib/socket";
import {
  ContentStatusChanged,
  NewContentFunctionality,
  SendDataToDigitalMarketer,
} from "./services/contentWriter/RealtimeUpdate";
import { NewContentAddedInQuterlyProjection } from "./services/CMORealtime/realtimeTaskUpdate";
import { addEmailReminderJob } from "./Testing/addWork";

env.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
// Initialize Socket.IO by passing it the http server
const io = initializeSocket(server);
console.log(io);

// Middleware
app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: ["http://localhost:5173", "https://dot-speaks.vercel.app"],
    credentials: true,
    exposedHeaders: ["x-new-access-token", "x-user-role"], // <-- Add this
  })
);
app.use(express.json());

app.use(cookieParser());

// Routes
app.use("/api/coo", cooRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendance);
app.use("/api/brandDeveloper", brandDeveloper);
app.use("/api/telleCaller", telleCaller);
app.use("/api/googleAuth", googleAuth);
app.use("/api/BrandHead", BrandHead);
app.use("/api/chattingSystem", ChattingSystem);
app.use("/api/contentWriter", contentWriter);
app.use("/api/client", clientRoute);
app.use("/api/designer", designerRoute);
app.use("/api/digitalMarket", digitalMarket);
app.use("/api/ceo", ceoRoute);
app.use("/api/cmo", cmoRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Role-Based Project Management System API" });
});

// Socket.IO connection logic <-- Add this whole block
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinChats", async ({ userId, chatIds }) => {
    const validChats = await prisma.chat_members.findMany({
      where: {
        user_id: userId,
        chat_id: { in: chatIds },
      },
      select: { chat_id: true },
    });

    validChats.forEach((chat: any) => socket.join(`chat_${chat.chat_id}`));
    console.log(
      `User ${userId} joined chats:`,
      validChats.map((c) => c.chat_id)
    );
  });

  socket.on("typing", ({ chatId, userId }) => {
    socket.to(`chat_${chatId}`).emit("typing", { userId });
  });
});

app.post("/add-reminder", async (req, res) => {
  const { meetingId } = req.body;

  if (!meetingId) {
    return res.status(400).json({ error: "meetingId required" });
  }

  await addEmailReminderJob(meetingId);
  res.json({ status: "Job added successfully!" });
});

server.listen(5001, () => {
  console.log(`🚀 Socket.IO server running on port 5001`);
});

app.listen(PORT, () => {
  console.log(`🚀 Serverssss running on port ${PORT}`);

  ListenNewClient();
  listenForLeadChanges();
  listenForBusinessDeveloperChanges();
  NewContentFunctionality();
  ContentStatusChanged();
  SendDataToDigitalMarketer();
  NewContentAddedInQuterlyProjection();
});

// src/workers/reminderWorker.ts
import { Worker, Job } from "bullmq";
import prisma from "../lib/prismaClient";
import { SendRemainderEmail } from "../utils/Functionality/Functions1";
import dotenv from "dotenv";
dotenv.config();

// docker run -d --name redis-bullmq -p 6379:6379 redis

const redisConnection = {
  host: process.env.docker_ip,
  port: 6379,
};

console.log("Worker script started. Attempting to create worker...");

const worker = new Worker(
  "email-reminders",
  async (job: Job) => {
    // console.log(`[Worker] ==> Received Job ID: ${job.id}. Attempting to process...`);
    // console.log("[Worker] Job Data:", job.data);

    try {
      if (!job.data || !job.data.meetingId) {
        throw new Error("Job data or meetingId is missing!");
      }

      const { meetingId } = job.data;
      // console.log(`[Worker] Processing ${reminderType} job for meeting ${meetingId}`);

      const meeting = await prisma.meetingEvent.findUnique({
        where: { googleEventId: meetingId },
      });

      if (!meeting) {
        throw new Error(
          `Meeting with googleEventId ${meetingId} not found in database.`
        );
      }

      await SendRemainderEmail(
        meeting.email,
        meeting.meetingLink,
        meeting.startTime,
        meeting.title
      );

      console.log(`
        --------------------------------------------------
        ✅ Successfully processed job for meeting: ${meeting.title} and email: ${meeting.email} and meetingLink: ${meeting.meetingLink}
        --------------------------------------------------
      `);
    } catch (error) {
      console.error(
        `[Worker] ❌ An error occurred inside job ${job.id}:`,
        error
      );
      throw error; // Re-throw the error so BullMQ marks the job as failed
    }
  },
  { connection: redisConnection }
);

// --- DIAGNOSTIC LISTENERS ---
worker.on("active", (job) => {
  console.log(`[Worker] Job is now active: ${job.id}`);
});

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`[Worker] Job ${job?.id} has FAILED with error: ${err.message}`);
});

worker.on("error", (err) => {
  console.error("[Worker] A connection-level error occurred:", err);
});

console.log("✅ Safer reminder worker is running and listening for jobs...");

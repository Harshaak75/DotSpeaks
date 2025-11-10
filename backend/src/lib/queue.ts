import { Queue } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

// Define your Redis connection options
const redisConnection = {
  host: process.env.docker_ip,
  port: 6379,
};

export const emailReminderQueue = new Queue("email-reminders", {
  connection: redisConnection,
});

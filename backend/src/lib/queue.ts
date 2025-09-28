import { Queue } from "bullmq";

// Define your Redis connection options
const redisConnection = {
  host: "127.0.0.1",
  port: 6379,
};

export const emailReminderQueue = new Queue("email-reminders", {
  connection: redisConnection,
});

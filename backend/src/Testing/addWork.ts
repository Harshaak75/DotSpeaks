import { emailReminderQueue } from "../lib/queue";

async function addEmailReminderJob(meetingId: string) {
  try {
    await emailReminderQueue.add("reminder", { meetingId });
    console.log(`✅ Job added for meetingId: ${meetingId}`);
  } catch (err) {
    console.error("❌ Failed to add job:", err);
  }
}
export { addEmailReminderJob };
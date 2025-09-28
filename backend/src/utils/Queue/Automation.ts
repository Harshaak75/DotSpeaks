import { emailReminderQueue } from "../../lib/queue";

type MeetingData = {
  googleEventId: string;
  email: string | null;
  title: string | null;
  startTime: string | null;
  endTime: string | null;
  meetingLink: string | null;
  cancelUrl: string | null;
  rescheduleUrl: string | null;
  userId: string;
};

export const scheduleRemindersForNewMeetings = async (
  newMeetings: MeetingData[]
) => {
  console.log(`Scheduling reminders for ${newMeetings.length} new meetings.`);

  for (const meeting of newMeetings) {
    const now = new Date();
    const startTime = new Date(meeting.startTime!);

    // --- FOR LOCAL TESTING (jobs run in 1, 2, and 3 minutes) ---
    const testDelays = {
      "1-minute-test": 1 * 60 * 1000, // 1 minute in milliseconds
      "2-minute-test": 2 * 60 * 1000,
      "3-minute-test": 3 * 60 * 1000,
    };

    for (const [type, delay] of Object.entries(testDelays)) {
      // Add the job to the queue
      await emailReminderQueue.add(
        "send-reminder", // Job name
        {
          // This is the data your worker will receive
          meetingId: meeting.googleEventId, // Use the unique ID to fetch details later
          reminderType: type,
          email: meeting.email,
          meetingLink: meeting.meetingLink,
          startTime: meeting.startTime,
          title: meeting.title
        },
        {
          // Options for the job
          delay: delay, // How long to wait before processing
          jobId: `${meeting.googleEventId}-${type}`, // Optional: Prevents duplicate jobs
        }
      );
      console.log(
        `[Queue] Added ${type} job for meeting ${meeting.googleEventId}`
      );
    }
  }
};

// C:\Users\Harsha AK\Desktop\project-bolt-sb1-y4qgjspa (1)\project\backend\src\workers\reminderWorker.ts

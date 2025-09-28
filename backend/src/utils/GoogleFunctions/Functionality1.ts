import prisma from "../../lib/prismaClient";
import { scheduleRemindersForNewMeetings } from "../Queue/Automation";

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

const extractLinks = (description: string | undefined | null) => {
  if (!description)
    return { meetingLink: null, cancelUrl: null, rescheduleUrl: null };

  // simple regex patterns
  const meetingLink =
    description.match(
      /https?:\/\/[^\s"]*(zoom|meet|teams|whereby)[^\s"]*/i
    )?.[0] || null;
  const cancelUrl =
    description.match(/https?:\/\/[^\s"]*cancel[^\s"]*/i)?.[0] || null;
  const rescheduleUrl =
    description.match(/https?:\/\/[^\s"]*reschedulings[^\s"]*/i)?.[0] || null;

  return { meetingLink, cancelUrl, rescheduleUrl };
};

function isCalendlyEvent(event: any): boolean {
  return (
    event.description?.includes("calendly.com") ||
    event.location?.includes("calendly.com") ||
    event.hangoutLink
  );
}

export const handleAutomation = async (events: any[], user_id: string) => {
  const meetingData: MeetingData[] = [];

  for (const ev of events) {
    // skip if it looks like birthday/holiday (Google marks those differently)
    if (!isCalendlyEvent(ev)) continue;

    const { meetingLink, cancelUrl, rescheduleUrl } = extractLinks(
      ev.description
    );

    const email = ev.attendees[1].email;

    const meeting: MeetingData = {
      googleEventId: ev.id,
      email: email,
      title: ev.summary || null,
      startTime: ev.start?.dateTime || ev.start?.date || null,
      endTime: ev.end?.dateTime || ev.end?.date || null,
      meetingLink,
      cancelUrl,
      rescheduleUrl,
      userId: user_id,
    };

    meetingData.push(meeting);
  }

  // filter only new events not in DB already
  const existingIds = await prisma.meetingEvent.findMany({
    where: { googleEventId: { in: meetingData.map((m) => m.googleEventId) } },
    select: { googleEventId: true },
  });
  const existingIdSet = new Set(existingIds.map((e) => e.googleEventId));

  const newMeetings = meetingData.filter(
    (m) => !existingIdSet.has(m.googleEventId)
  );

  if (newMeetings.length > 0) {
    await prisma.meetingEvent.createMany({
      data: newMeetings,
      skipDuplicates: true, // safety net
    });
  }
  await scheduleRemindersForNewMeetings(newMeetings);

  return newMeetings;
};

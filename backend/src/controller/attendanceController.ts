import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prismaClient";

// strat break
export const Start_Break = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user_id = req.user?.user_id;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // 2. Create a date object for the end of today.
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const attendanceRecord = await prisma.attendance.findFirst({
    where: {
      user_id: user_id,
      login_time: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    select: {
      id: true,
    },
  });

  if (!attendanceRecord) {
    return res
      .status(404)
      .json({ error: "Attendance record not found for today" });
  }

  const response = await prisma.break_events.create({
    data: {
      attendance_id: attendanceRecord.id,
      break_start: new Date(),
    },
  });
  // Your logic for starting a break goes here
  res.json({ message: "Break started", break_id: response.id });
};

export const End_Break = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { break_id } = req.params;
    if (!break_id) {
      return res.status(400).json({ error: "Break ID is required" });
    }

    const response = await prisma.break_events.update({
      where: {
        id: break_id,
      },
      data: {
        break_end: new Date(),
      },
    });
    res.json({ message: "Break ended" });
  } catch (error) {
    console.error("Error ending break:", error);
    res.status(500).json({ error: "Failed to end break" });
  }
};

export const handleLogout = async (user_id: any) => {
  try {
    // --- THIS IS THE FIX ---
    // This query is now extremely specific to prevent finding old records.

    // 1. We still define the start and end of today to handle timezone issues.
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999);

    // 2. The query now checks for BOTH conditions:
    //    - The login must have happened TODAY.
    //    - The logout_time must be NULL.
    const attendanceRecord = await prisma.attendance.findFirst({
      where: {
        user_id: user_id,
        logout_time: null, // It must be an open session
        login_time: {      // And it must have started today
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      include: {
        break_events: true,
      },
    });

    // This check is still important.
    if (!attendanceRecord || !attendanceRecord.login_time) {
      console.log("No active attendance record found from today to log out from.");
      return { message: "No active session to log out from." };
    }

    // --- Added logging to help you see what's happening ---
    console.log(`Found attendance record ID: ${attendanceRecord.id} with login time: ${attendanceRecord.login_time.toISOString()}`);


    // --- The rest of your calculation logic is correct ---
    let totalBreakEventsMilliSeconds = 0;
    for (const breakEvent of attendanceRecord.break_events) {
      if (breakEvent.break_start && breakEvent.break_end) {
        const breakStart = new Date(breakEvent.break_start);
        const breakEnd = new Date(breakEvent.break_end);
        totalBreakEventsMilliSeconds += breakEnd.getTime() - breakStart.getTime();
      }
    }
    const totalBreakEventsMinutes = Math.round(
      totalBreakEventsMilliSeconds / (1000 * 60)
    );

    const logoutTimestamp = new Date();
    const loginTime = new Date(attendanceRecord.login_time);
    const totalSessionMilliseconds =
      logoutTimestamp.getTime() - loginTime.getTime();
    const workedMilliSeconds =
      totalSessionMilliseconds - totalBreakEventsMilliSeconds;
      
    const hoursWorkedDecimal = parseFloat(
      (workedMilliSeconds / (1000 * 60 * 60)).toFixed(2)
    );

    console.log("Calculated hours worked:", hoursWorkedDecimal); // This should now be a small number

    await prisma.attendance.update({
      where: {
        id: attendanceRecord.id,
      },
      data: {
        logout_time: logoutTimestamp,
        hours_worked: hoursWorkedDecimal,
        total_break_minutes: totalBreakEventsMinutes,
      },
    });

    return { message: "Logout handled successfully." };

  } catch (error) {
    console.error("Error during logout handling:", error);
    throw new Error("Failed to handle logout");
  }
};

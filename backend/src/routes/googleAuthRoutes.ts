import express, { Request } from "express";
const router = express.Router();
import { google } from "googleapis";
import { authenticate_user } from "../middleware/authMiddleware";
import prisma from "../lib/prismaClient";
import { requireBusinessDeveloper } from "../middleware/GoogleTask/GoogleMiddleware";
import { handleAutomation } from "../utils/GoogleFunctions/Functionality1";

// Extend Express Request interface to include isBusinessDeveloper
declare global {
  namespace Express {
    interface Request {
      isBusinessDeveloper?: boolean;
    }
  }
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

router.get("/google/redirect",authenticate_user, (req, res) => {
  console.log("i am going")
  const scopes = ["https://www.googleapis.com/auth/calendar.readonly"];

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
    state: JSON.stringify({ user_id: req.user?.user_id }), // pass logged-in user ID
  });

  res.redirect(authorizationUrl);
});

router.get("/google/callback", async (req, res) => {
  const { code, state }: any = req.query; // The authorization code from Google

  try {
    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const { access_token, refresh_token, expiry_date } = tokens;

    // IMPORTANT: Get the logged-in user's ID
    const { user_id } = JSON.parse(state);
    console.log(user_id)

    // Save the tokens to the user's profile in the database
    await prisma.profiles.update({
      where: { user_id: user_id },
      data: {
        googleAccessToken: access_token,
        googleRefreshToken: refresh_token,
        googleTokenExpiryDate: expiry_date ? new Date(expiry_date) : null,
      },
    });

    // Redirect user back to the dashboard calendar page
    res.send("<script>window.close();</script>");
  } catch (error) {
    console.error("Error authenticating with Google:", error);
    res.status(500).send("Authentication failed");
  }
});

router.get("/google/events", authenticate_user,requireBusinessDeveloper, async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Authentication error: User ID not found." });
    }

    const profile = await prisma.profiles.findUnique({
      where: {
        user_id: user_id,
      },
    });

    if (!profile || !profile.googleAccessToken) {
      return res
        .status(400)
        .json({ message: "Google Calendar is not connected for this user." });
    }

    oauth2Client.setCredentials({
      access_token: profile.googleAccessToken,
      refresh_token: profile.googleRefreshToken,
      expiry_date: profile.googleTokenExpiryDate?.getTime(),
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Fetch events from the primary calendar for the next 30 days
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 15,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items;

    if (req.isBusinessDeveloper && events?.length) {
      await handleAutomation(events, user_id); // your DB + queue logic
    }
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    res.status(500).json({ message: "Failed to fetch calendar events." });
  }
});

export default router;

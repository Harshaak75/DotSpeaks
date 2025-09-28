import express from "express";
import prisma from "../lib/prismaClient";
import {
  CompareFunction,
  HashingFunction,
} from "../utils/authUtils/authFunction";
import {
  GenerateTokens,
  VerifyRefreshToken,
} from "../utils/tokensUtils/tokenFunction";
import env from "dotenv";
import { authenticate_user } from "../middleware/authMiddleware";
import { handleLogout } from "../controller/attendanceController";
import crypto, { Hash } from "crypto";
import { sendPasswordResetEmail } from "../utils/Functionality/Functions1";

env.config();

const router = express.Router();

// CREATING THE REGISTER PAGE PROTECTED ROUTE

// "authenticateAdmin" laterly create a protected route

router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  const saltRounds = Number(process.env.SALT_ROUNDS);
  if (!saltRounds) {
    return res.status(500).json({
      error: "SALT_ROUNDS is not defined in the environment variables",
    });
  }
  const hashedPassword = HashingFunction(password, saltRounds);

  const user = await prisma.users.create({
    data: {
      email,
      password: hashedPassword,
      role, // like COO, HR, etc.
    },
  });

  res.status(201).json({
    message: "User created",
    user: { email: user.email, role: user.role },
  });
});

// login for all the domain users

router.post("/login", async (req: any, res: any) => {
  const { email, password } = req.body;

  const saltRounds = process.env.SALT_ROUNDS;
  if (!saltRounds) {
    return res.status(500).json({
      error: "SALT_ROUNDS is not defined in the environment variables",
    });
  }

  try {
    const userData = await prisma.users.findUnique({
      where: { email },
      select: {
        password: true,
        role: true,
        id: true,
      },
    });

    if (!userData) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!userData.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isPasswordValid = CompareFunction(password, userData.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = GenerateTokens(
      userData.id,
      userData.role
    );

    // console.log("Access Token:", accessToken, "Refresh Token:", refreshToken);

    // add the login to the attendance table

    const loginTimestamp = new Date();

    console.log("Login timestamp:", loginTimestamp);

    console.log("The user ID being used is:", userData.id);

    await prisma.attendance.create({
      data: {
        user_id: userData.id,
        login_time: loginTimestamp,
      },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: "Strict", // Adjust based on your requirements
      maxAge: 1000 * 60 * 60 * 24 * 20, // 20 days
    });

    res
      .status(200)
      .json({ message: "Login successful", accessToken, role: userData.role });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// client login
router.post("/Clientlogin", async (req: any, res: any) => {
  const { email, password } = req.body;

  const saltRounds = process.env.SALT_ROUNDS;
  if (!saltRounds) {
    return res.status(500).json({
      error: "SALT_ROUNDS is not defined in the environment variables",
    });
  }

  try {
    const userData = await prisma.clients.findUnique({
      where: { email },
      select: {
        password: true,
        id: true,
      },
    });

    if (!userData) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!userData.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = CompareFunction(password, userData.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.log("user id: ", userData.id);

    const { accessToken, refreshToken } = GenerateTokens(userData.id, "CLIENT");

    const loginTimestamp = new Date();

    console.log("Login timestamp:", loginTimestamp);

    console.log("The user ID being used is:", userData.id);

    console.log(accessToken, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: "Strict", // Adjust based on your requirements
      maxAge: 1000 * 60 * 60 * 24 * 20, // 20 days
    });

    res
      .status(200)
      .json({ message: "Login successful", accessToken, role: "CLIENT" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/authCheck", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    console.log("resfresh token", refreshToken);

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    const { accessToken, role } = await VerifyRefreshToken(refreshToken);

    console.log("accessToekn: ", accessToken, "role: ", role);

    res
      .status(200)
      .json({ message: "Auth check successful", accessToken, role });
  } catch (error) {
    console.error("Error during auth check:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", authenticate_user, async (req, res) => {
  try {
    // logout make update in attendance

    const user_id = req.user?.user_id;
    await handleLogout(user_id);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required." });
  }

  try {
    // 1. Hash the incoming token so we can find it in the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Find the user by the hashed token & ensure it hasn't expired
    const client = await prisma.clients.findUnique({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gte: new Date() }, // gte = greater than or equal to now
      },
    });

    if (!client) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired." });
    }

    const saltRounds = Number(process.env.SALT_ROUNDS);
    if (!saltRounds) {
      return res.status(500).json({
        error: "SALT_ROUNDS is not defined in the environment variables",
      });
    }

    const hashedPassword = HashingFunction(newPassword, saltRounds);

    // 4. Update the user's password and clear the reset token fields
    await prisma.clients.update({
      where: { id: client.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "An error occurred." });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const client = await prisma.clients.findUnique({ where: { email } });

    if (client) {
      // 1. Generate a secure, random token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // 2. Hash the token before saving it to the database
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // 3. Set an expiration date (e.g., 15 minutes from now)
      const expires = new Date(Date.now() + 15 * 60 * 1000);

      // 4. Update the user's record with the hashed token and expiration
      await prisma.clients.update({
        where: { email },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpires: expires,
        },
      });

      // 5. Create the reset URL and send the email
      const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(
        client.company_name ?? "",
        client.email,
        resetURL
      );
    }

    res
      .status(200)
      .json({
        message:
          "If a user with that email exists, a password reset link has been sent.",
      });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "An error occurred." });
  }
});

router.post("/Clientlogout", authenticate_user, async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Client Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

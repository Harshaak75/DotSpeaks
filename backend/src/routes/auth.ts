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
import { ensureFreshKeycloakToken } from "../middleware/validateKeycloakBeforeHRM";
import axios from "axios";
import * as jwt from "jsonwebtoken";

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

  if(!email && !password){
    return res.status(500).json({message:"Provide the email or password"})
  }

  const tokenUrl = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
  console.log("Token URL: ", tokenUrl, "Email: ", email, "Password: ", password, "Client ID: ", process.env.KEYCLOAK_PROVISIONER_CLIENT_ID, "Client Secret: ", process.env.KEYCLOAK_PROVISIONER_CLIENT_SECRET);

  const body = new URLSearchParams({
    grant_type: "password",
    client_id: process.env.KEYCLOAK_PROVISIONER_CLIENT_ID!, // e.g. hrm-backend
    client_secret: process.env.KEYCLOAK_PROVISIONER_CLIENT_SECRET!, // from Credentials tab
    username: email,
    password,
  });

      let kc;
    try {
      const { data } = await axios.post(tokenUrl, body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      kc = data;
    } catch (err: any) {
      return res.status(401).json({ error: "Invalid credentials (Keycloak)", err });
    }

    const decoded = JSON.parse(
      Buffer.from(kc.access_token.split(".")[1], "base64").toString("utf8")
    );

    const keycloakSub = decoded.sub;
    const roles = decoded.realm_access?.roles || "";

    
    const role = Array.isArray(roles) ? roles[0]: roles;
    console.log("roles: ", role)
    let user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.users.create({
        data: {
          email,
          password: "", // handled by Keycloak
          role: role,
        },
      });
    }

    await prisma.externalIdentity.upsert({
      where: { email },
      update: { subject: keycloakSub },
      create: {
        provider: "keycloak",
        subject: keycloakSub,
        email,
        userId: user.id,
      },
    });

    const appToken = jwt.sign(
      { id: user.id, role: role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("keycloak_token", kc.access_token, {
      httpOnly: true,
      secure: true, // ✅ must be false in localhost (no HTTPS)
      sameSite: "none", // ✅ allows cookies for cross-site GETs
      maxAge: kc.expires_in * 1000, // 5 mins
    });

    res.cookie("keycloak_refresh_token", kc.refresh_token, {
      httpOnly: true,
      secure: true, // ✅ must be false in localhost (no HTTPS)
      sameSite: "none", // ✅ allows cookies for cross-site GETs
      maxAge: kc.refresh_expires_in * 1000, // ~30 mins
    });

  try {

    const { accessToken, refreshToken } = GenerateTokens(
      user.id,
      role
    );

    console.log("Access Token:", accessToken, "Refresh Token:", refreshToken);

    // add the login to the attendance table

    const loginTimestamp = new Date();

    // console.log("Login timestamp:", loginTimestamp);

    // console.log("The user ID being used is:", userData.id);

    await prisma.attendance.create({
      data: {
        user_id: user.id,
        login_time: loginTimestamp,
      },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Set to true in production
      sameSite: "none", // Adjust based on your requirements
      maxAge: 1000 * 60 * 60 * 24 * 20, // 20 days
    });

      res.json({
      accessToken,
      apptoken: appToken, // your app token (frontend uses this)
      keycloakToken: kc.access_token,
      role: user.role,
      userId: user.id,
      email,
    });
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

router.get("/go-to-hrm", ensureFreshKeycloakToken, async (req, res) => {
  try {
    const { tenantCode } = req.query;
    const backend_url = process.env.HRM_BACKEND_ROUTE

    if (!tenantCode)
      return res.status(400).json({ error: "tenantCode is required" });

    const accessToken = req.validAccessToken;

    if(!accessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Redirect to HRM frontend
    const hrmRedirectUrl = `${backend_url}/api/tenant/sso-login/${tenantCode}?token=${accessToken}`;
    res.json({ redirectUrl: hrmRedirectUrl });
  } catch (err: any) {
    console.error("Redirect failed:", err.message);
    res.status(500).json({ error: "Failed to redirect to HRM" });
  }
});

export default router;

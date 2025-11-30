import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { VerifyRefreshToken } from "../utils/tokensUtils/tokenFunction";
import axios from "axios";

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        role: string;
      };
    }
  }
}

// export const authenticate_user = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<any> => {
//   let token = req.headers.authorization?.split(" ")[1]; // Assuming Bearer token format

//   if(!token){
//     token = req.query.tokens as string
//   }

//   const refreshTokens = req.cookies?.refreshToken;

//   if (!token) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   try {
//     const decoded: any = jwt.verify(token, process.env.ACCESS_SECRET as string);
//     req.user = { user_id: decoded.userId, role: decoded.role }; // Attach user info to request object
//     next();
//   } catch (error: any) {
//     if (error.name === "TokenExpiredError" && refreshTokens) {
//       // Handle token expiration and attempt refresh
//       const { accessToken, role, userId, refreshToken } =
//         await VerifyRefreshToken(refreshTokens);
//       req.user = { user_id: userId as string, role: role as string }; // Attach user info to request object

//       if (refreshToken) {
//         res.cookie("refreshToken", refreshToken, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production", // Set to true in production
//           sameSite: "strict", // Adjust based on your requirements
//           maxAge: 1000 * 60 * 60 * 24 * 20, // 20 days
//         });
//       }
//       res.setHeader("x-new-access-token", accessToken);
//       res.setHeader("x-user-role", role);

//       next();
//     } else {
//       console.error("Authentication error:", error);
//       return res.status(401).json({ error: "Invalid or expired token" });
//     }
//   }
// };

export const authenticate_user = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const appToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : (req.query.tokens as string);

  const appRefreshToken = req.cookies?.refreshToken;

  // ✅ Keycloak tokens only from cookies (not exposed to user)
  const kcAccessToken = req.cookies?.keycloak_token;
  const kcRefreshToken = req.cookies?.keycloak_refresh_token;

  console.log(kcAccessToken, kcRefreshToken)

  let appTokenValid = true;
  let keycloakTokenValid = true;

  let appDecoded: any = null;
  let kcDecoded: any = null;

  /*****************************************
   * 1. VERIFY APP TOKEN (USER AUTH)
   *****************************************/
  if (appToken) {
    try {
      appDecoded = jwt.verify(appToken, process.env.ACCESS_SECRET!);
    } catch (err: any) {
      if (
        err.name === "TokenExpiredError" ||
        err.name === "JsonWebTokenError"
      ) {
        appTokenValid = false;
      }
    }
  } else {
    appTokenValid = false;
  }

  /*****************************************
   * 2. VERIFY KEYCLOAK TOKEN (SILENT)
   *****************************************/
  if (kcAccessToken) {
    const decoded: any = jwt.decode(kcAccessToken);

    if (!decoded || decoded.exp * 1000 < Date.now()) {
      keycloakTokenValid = false;
    } else {
      kcDecoded = decoded;
    }
  } else {
    keycloakTokenValid = false;
  }

  console.log("token faild")

  /*****************************************
   * ✅ 3. BOTH VALID → ALLOW
   *****************************************/
  if (appTokenValid && keycloakTokenValid) {
    req.user = {
      user_id: appDecoded.userId,
      role: appDecoded.role,
    };
    return next();
  }

  console.log("❌ One or both tokens invalid");

  /*****************************************
   * 🔁 4. APP TOKEN EXPIRED → REFRESH ONLY APP TOKEN
   *****************************************/
  if (!appTokenValid && appRefreshToken) {
    const { accessToken, role, userId, refreshToken } =
      await VerifyRefreshToken(appRefreshToken);

    // ✅ Only APP TOKEN is sent back to frontend
    res.setHeader("x-new-access-token", accessToken);
    res.setHeader("x-user-role", role);

    if (refreshToken) {
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 20,
      });
    }

    req.user = {
      user_id: userId,
      role: role,
    };

    appDecoded = { userId, role };
    appTokenValid = true;
  }

  console.log("came here 2")

  /*****************************************
   * 🔁 5. KEYCLOAK TOKEN EXPIRED → SILENT REFRESH
   *****************************************/
  if (!keycloakTokenValid && kcRefreshToken) {
    try {
      const tokenUrl = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

      const body = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.KEYCLOAK_PROVISIONER_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_PROVISIONER_CLIENT_SECRET!,
        refresh_token: kcRefreshToken,
      });

      const { data } = await axios.post(tokenUrl, body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // ✅ Keycloak tokens only stored in cookie (never sent to user)
      res.cookie("keycloak_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: data.expires_in * 1000,
      });

      res.cookie("keycloak_refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: data.refresh_expires_in * 1000,
      });

      keycloakTokenValid = true;
    } catch (err) {
      console.error("❌ Keycloak refresh failed:", err);
      return res
        .status(401)
        .json({ error: "Keycloak session expired. Please login again." });
    }
  }
  console.log("came here")

  /*****************************************
   * ✅ 6. CONTINUE IF BOTH VALID NOW
   *****************************************/
  if (appTokenValid && keycloakTokenValid) {
    return next();
  }

  console.log("❌ Both tokens invalid");

  return res
    .status(401)
    .json({ error: "Session expired. Please login again." });
};

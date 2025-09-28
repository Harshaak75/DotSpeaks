import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prismaClient";
import supabase from "../../config/supabase";
import { HashingFunction } from "../../utils/authUtils/authFunction";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../../utils/Functionality/Functions1";

export const ClientDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.user_id;

  try {
    const brandHead = await prisma.profiles.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!brandHead) {
      return res.status(404).json({ error: "Brand Head not found" });
    }

    const client = await prisma.clientAssignment.findMany({
      where: {
        BH_profile_id: brandHead.id,
        clients: {
          is: {
            teamId: null,
          },
        },
      },
      select: {
        clients: true,
      },
    });
    console.log(client);
    res.status(200).json(client);
  } catch (error) {
    console.error("Error fetching client details:", error);
    res.status(500).json({ error: "Failed to fetch client details" });
  }
};

export const CreateTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.user_id;

  const { packageName } = req.params;

  const { data } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const packages = await prisma.package.findUnique({
      where: {
        name: packageName,
      },
      select: {
        id: true,
      },
    });

    if (!packages) {
      return res.status(404).json({ error: "Package not found" });
    }

    // profile id

    const profile = await prisma.profiles.findFirst({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // create a team

    const team = await prisma.team.create({
      data: {
        name: data[0].teamName,
        packageId: packages.id,
        brandHeadId: profile.id,
      },
    });

    // create a team member record

    console.log("data:", data);

    const members = [
      { role: "Graphic Designer", profileId: data[0].graphicDesignerId },
      { role: "Digital Marketer", profileId: data[0].digitalMarketerId },
      { role: "Content Strategist", profileId: data[0].contentStrategistId },
    ].filter((m) => m.profileId); // remove empty ones

    console.log(members);

    // 3. Insert all members
    await prisma.teamMember.createMany({
      data: members.map((m) => ({
        teamId: team.id,
        profileId: m.profileId,
        role: m.role,
      })),
    });

    //4. push team id to client

    await prisma.clients.update({
      where: {
        id: data[0].clientId,
      },
      data: {
        teamId: team.id,
      },
    });

    res.status(201).json({ message: "Created" });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Failed to create team" });
  }
};

export const FetchCardDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.user_id;

  try {
    // profile id

    // const profile = await prisma.profiles.findFirst({
    //   where: {
    //     user_id: userId,
    //   },
    //   select: {
    //     id: true,
    //   },
    // });

    // if (!profile) {
    //   return res.status(404).json({ error: "Profile not found" });
    // }

    const data = await prisma.team.findMany({
      where: {
        brandHead: {
          user_id: userId,
        },
      },
      select: {
        clients: {
          select: {
            company_name: true,
          },
        },
        members: {
          select: {
            role: true,
            profile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        name: true,
        id: true,
      },
    });
    const formattedData = data.map((team) => {
      // Safely get the client name from the first client in the array
      const clientName =
        team.clients.length > 0 ? team.clients[0].company_name : null;

      const members = team.members.map((member) => {
        return {
          profileId: member.profile.id,
          name: member.profile.name,
          role: member.role, // Also including the role as it's available
        };
      });

      return {
        teamId: team.id, // ⬅️ Add this line
        teamName: team.name,
        clientName: clientName,
        members: members,
      };
    });

    console.log(formattedData);

    // console.log(card)
    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching card details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const CreateClientAccountFromBrandHead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { formData } = req.body;

  try {
    const temporaryPassword = crypto.randomBytes(32).toString("hex");

    const saltRounds = Number(process.env.SALT_ROUNDS);
    if (!saltRounds) {
      return res.status(500).json({
        error: "SALT_ROUNDS is not defined in the environment variables",
      });
    }

    const hashedPassword = HashingFunction(temporaryPassword, saltRounds);

    // 2. Generate a secure, random token for the reset link
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 3. Hash the token before saving it to the database for security
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 4. Set an expiration date for the token (e.g., 24 hours from now)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 5. Create the client account with the temporary hashed password and the reset token
    // const newClient = await prisma.clients.create({
    //   data: {
    //     email: formData.emailAddress,
    //     company_name: formData.companyName,
    //     package: formData.selectedPackage,
    //     password: hashedPassword, // Store the temporary hashed password
    //     passwordResetToken: hashedToken, // Store the hashed reset token
    //     passwordResetExpires: expires,

    //     OnboardingData: {
    //       create: {
    //         yearOfEstablishment: formData.yearOfEstablishment,
    //         about: formData.about,
    //         websiteUrl: formData.websiteUrl,
    //         industry: formData.industry,
    //         keyProducts: formData.keyProducts,
    //         primaryContactPerson: formData.primaryContactPerson,
    //         positionTitle: formData.positionTitle,
    //         contactNumber: formData.contactNumber,
    //         marketingGoals: formData.marketingGoals || {},
    //         currentMarketingActivities:
    //           formData.currentMarketingActivities || {},
    //         socialMediaAccounts: formData.socialMediaAccounts || {},
    //         timeline: formData.timeline,
    //         targetAudience: formData.targetAudience,
    //         currentChallenges: formData.currentChallenges,
    //         competitors: formData.competitors || [],
    //       },
    //     },
    //   },
    //   include: { OnboardingData: true },
    // });
    console.log(formData)

    const client = await prisma.clients.findUnique({
      where: { email: formData.emailAddress }, // Use the provided email
    });

    if (!client) {
      throw new Error("Client not found"); // If client is not found, throw an error
    }

    // Step 2: Update the client with password reset token and expiration
    const updatedClient = await prisma.clients.update({
      where: { email: formData.emailAddress }, // Use email to identify the client
      data: {
        passwordResetToken: hashedToken, // Update the password reset token
        passwordResetExpires: expires, // Update the expiration time
      },
    });

    // Step 3: Create OnboardingData for the client
    const onboardingData = await prisma.clientOnboardingData.create({
      data: {
        clientId: client.id, // Link OnboardingData to the client
        yearOfEstablishment: formData.yearOfEstablishment,
        about: formData.about,
        websiteUrl: formData.websiteUrl,
        industry: formData.industry,
        keyProducts: formData.keyProducts,
        primaryContactPerson: formData.primaryContactPerson,
        positionTitle: formData.positionTitle,
        contactNumber: formData.contactNumber,
        marketingGoals: formData.marketingGoals || {},
        currentMarketingActivities: formData.currentMarketingActivities || {},
        socialMediaAccounts: formData.socialMediaAccounts || {},
        timeline: formData.timeline,
        targetAudience: formData.targetAudience,
        currentChallenges: formData.currentChallenges,
        competitors: formData.competitors || [],
      },
    });

    // Return the updated client and the created onboarding data

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(
      formData.primaryContactPerson, // Client Name
      formData.emailAddress, // Client Email
      resetURL // The secure reset link
    );

    res.status(201).json({
      message:
        "Client account created successfully! A password setup email has been sent.",
    });
  } catch (error: any) {
    console.error("Error during client creation:", error);
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res
        .status(409)
        .json({ message: "A client with this email already exists." });
    }
    next(error);
  }
};

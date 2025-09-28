import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prismaClient";
import { HashingFunction } from "../../utils/authUtils/authFunction";
import { SendEmailToClient } from "../../utils/Functionality/Functions1";

export const CreateClientAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, companyName, packages, leadId } = req.body;

    console.log(email, password, companyName, packages);

    const saltRounds = Number(process.env.SALT_ROUNDS);
    if (!saltRounds) {
      return res.status(500).json({
        error: "SALT_ROUNDS is not defined in the environment variables",
      });
    }
    const hashedPassword = HashingFunction(password, saltRounds);

    // assign the client to brand head based on the package

    const user = await prisma.clients.create({
      data: {
        email,
        password: hashedPassword,
        company_name: companyName,
        package: packages,
        sourceLeadId: leadId,
      },
    });

    // change the status of the businessdeveloper

    res.status(201).json({
      message: "User created",
      user: { email: user.email, role: "CLIENT" },
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const GetInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.user_id;

  try {
    const data = await prisma.bussinessDeveloper.findMany({
      where: {
        assignedToId: userId,
        status: { not: "Completed" },
      },
      select: {
        forwardedByTelecommunicatorId: true,
      },
    });

    const teleCommunicatedId = [
      ...new Set(data.map((item) => item.forwardedByTelecommunicatorId)),
    ].filter((id): id is string => id !== null);

    const teleCommunicators = await prisma.users.findMany({
      where: {
        id: {
          in: teleCommunicatedId,
        },
      },
      select: {
        id: true,
        profile: {
          select: {
            name: true,
          },
        },
      },
    });
    res
      .status(200)
      .json({ message: "The data is fetched", data: teleCommunicators });
  } catch (error) {
    res.status(500).json({ message: "Something is wrong" });
  }
};

export const GetTellerCallerLeadInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.user_id;

  try {
    const teleId = req.params.id;

    const data = await prisma.bussinessDeveloper.findMany({
      where: {
        assignedToId: userId,
        forwardedByTelecommunicatorId: teleId,
        status: { not: "Completed" },
      },
      select: {
        TeleCommunication: true,
      },
    });

    // countthe ststus
    const telleInfo = await prisma.telecommunicatorLeads.groupBy({
      by: ["status"],
      where: {
        assignedToId: teleId, // UUID automatically handled
      },
      _count: {
        _all: true,
      },
    });

    let forwardedCount = 0;
    let othersCount = 0;

    for (const item of telleInfo) {
      if (item.status === "Forwarded") {
        forwardedCount = item._count._all;
      } else if (item.status !== "New" && item.status !== "Not Interested") {
        othersCount += item._count._all;
      }
    }

    othersCount = othersCount + forwardedCount;

    console.log({ forwardedCount, othersCount });
    res.status(200).json({ data, forwardedCount, othersCount });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const ScheduleMeet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const userId = req.user?.user_id;

  try {
    const userData = await prisma.telecommunicatorLeads.findUnique({
      where: {
        id: id,
      },
    });

    // business developer data

    const businessdeveloper = await prisma.profiles.findUnique({
      where: {
        user_id: userId,
      },
    });

    const subject = "Welcome! Please Schedule Your Meeting";

    if (businessdeveloper) {
      await SendEmailToClient(userData, businessdeveloper);
    } else {
      console.error(
        `Could not send email. Profile not found for Brand Head ID: ${userId}`
      );
    }
    console.log("userData: ", userData);
    res.status(200).json({ message: "Meeting scheduled successfully" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prismaClient";
import supabase from "../../config/supabase";

const bigIntToString = (obj: any) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );    
};

export const setTargets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { targets, totalRevenue } = req.body;

    if (!targets || !Array.isArray(targets) || targets.length === 0) {
      return res
        .status(400)
        .json({ message: "Targets data is required and must be an array" });
    }

    // Prepare the quarterly data for a single, nested write operation
    const quarterlyData = targets.map((target: any) => ({
      quarterName: target.quarter, // Changed 'quater' to 'quarterName' for consistency
      projectedRevenue: target.revenue,
      projectedExpenses: target.expenses,
      projectedSavings: target.savings,
    }));

    // Perform a single atomic transaction using Prisma's nested writes
    const newYearlyTarget = await prisma.yearlyTarget.create({
      data: {
        ceoId: userId,
        totalRevenueTarget: totalRevenue,
        year: new Date().getFullYear(),
        quarters: {
          createMany: {
            data: quarterlyData,
          },
        },
      },
    });

    if (!newYearlyTarget) {
      return res
        .status(500)
        .json({ message: "Failed to create yearly target" });
    }

    const sanitizedTarget = bigIntToString(newYearlyTarget);

    return res.status(201).json({
      message: "Targets created successfully",
      yearlyTarget: sanitizedTarget,
    });
  } catch (error) {
    console.error("Error setting targets:", error);
    // You can check for a specific error type to give a better response
    return res.status(500).json({ message: "Internal server error" });
  }
};

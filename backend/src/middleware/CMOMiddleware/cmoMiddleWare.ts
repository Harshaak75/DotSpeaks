import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prismaClient";
import supabase from "../../config/supabase";
import { HashingFunction } from "../../utils/authUtils/authFunction";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../../utils/Functionality/Functions1";
import xlsx from "xlsx";
import fs from "fs";

export const addTargets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data } = req.body;
    // console.log("data", data);

    const userId = req.user?.user_id;

    if (!userId) {
      res.status(500).json({ message: "The userId is not Found" });
      return;
    }

    const lastTarget = await prisma.cmoTarget.findFirst({
      where: { cmoId: userId, targetQuarter: data.targetQuarter },
      orderBy: { version: "desc" },
    });

    console.log("lastTarget: ", lastTarget);

    const newVersion = lastTarget ? lastTarget.version + 1 : 1;

    console.log("done");

    const response = await prisma.cmoTarget.create({
      data: {
        cmoId: userId,
        version: newVersion,
        targetQuarter: data.targetQuarter,
        quarterlyRevenue: data.monthlyRevenue,
        monthlyUnits: data.monthlyUnits,
        totalTargetLeads: data.totalTargetLeads,
        packages: {
          create: data.packages.map((pkg: any) => ({
            name: pkg.name,
            target: pkg.target,
            achieved: pkg.achieved,
          })),
        },
      },
    });

    console.log("response: ", response);

    res.status(200).json({ message: "The status is done" });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const CmoTargets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.user_id;

    const quarter = req.params.quarter;

    const response = await prisma.cmoTarget.findFirst({
      where: {
        cmoId: userId,
        targetQuarter: quarter,
      },
      include: {
        packages: true,
      },
      orderBy: {
        version: "desc",
      },
    });

    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const UploadLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const quarter = req.body.quarter || "Q1";
    const Package = req.body.Package || ""

    console.log("Package name",Package)

    const package_data = await prisma.package.findFirst({
      where:{
        name: Package
      },
      select:{
        id: true
      }
    })

    console.log("Packae_info", package_data)

    if(!package_data){
      return res.status(400).json({ message: "Package ID is required" });
    }

    // 1️⃣ Upload file to Supabase
    const bucketName = "leads_uploads";
    const filePath = `uploads/${Date.now()}-${file.originalname}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res.status(500).json({ message: "File upload failed" });
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;

    // 2️⃣ Parse Excel
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // 3️⃣ Create UploadedFile entry
    const latestFile = await prisma.uploadedLeads.findFirst({
      where: { quarter },
      orderBy: { version: "desc" },
    });

    const version = latestFile ? latestFile.version + 1 : 1;

    const uploadedFile = await prisma.uploadedLeads.create({
      data: {
        fileName: file.originalname,
        uploadedBy: userId,
        quarter,
        version,
        totalLeads: data.length,
        packageId: package_data.id
      },
    });

    // 4️⃣ Prepare Leads
    const leadsToCreate = data.map((row: any) => {
      const knownFields = {
        company: row["company"] || row["Company Name"] || null,
        phone: row["phone"]
          ? String(row["phone"])
          : row["Phone Number"]
          ? String(row["Phone Number"])
          : null,
        website: row["website"] || row["Website"] || null,
        industry: row["industry"] || row["Industry"] || null,
        city: row["city"] || row["City"] || null,
        source: row["source"] || "CMO Excel Upload",
        email: row["email"] || row["Email"] || null,
        uploadedLeadsId: uploadedFile.id,
        packageId: package_data.id,
        status: "New",
      };

      const dynamicData: any = {};
      Object.keys(row).forEach((key) => {
        if (!Object.keys(knownFields).includes(key.toLowerCase())) {
          dynamicData[key] = row[key];
        }
      });

      return { ...knownFields, dynamicData };
    });

    // 5️⃣ Save all leads
    await prisma.telecommunicatorLeads.createMany({
      data: leadsToCreate,
    });

    // 6️⃣ Assign leads to telecallers in batches of 42 per day
    const telepeople = await prisma.users.findMany({
      where: { role: "TELLECALLER" },
    });

    const DAILY_LIMIT = 42;

    const allLeads = await prisma.telecommunicatorLeads.findMany({
      where: { uploadedLeadsId: uploadedFile.id },
      orderBy: { created_at: "asc" },
    });

    let leadIndex = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (leadIndex < allLeads.length) {
      for (const tele of telepeople) {
        if (leadIndex >= allLeads.length) break;

        const batch = allLeads.slice(leadIndex, leadIndex + DAILY_LIMIT);

        await prisma.telecommunicatorLeads.updateMany({
          where: { id: { in: batch.map((l) => l.id) } },
          data: { assignedToId: tele.id, assignedDate: currentDate },
        });

        leadIndex += batch.length;
      }

      // Move to next day after all telepeople processed
      currentDate.setDate(currentDate.getDate() + 1);
    }


    // I should also update the CMOTarget table achived

    const CMO_data: any = await prisma.cmoTarget.findFirst({
      where: {
        cmoId: userId,
        targetQuarter: quarter,
      },
      include: {
        packages: {
          select:{
            cmoTargetId: true
          }
        },
      },
      orderBy: {
        version: "desc",
      },
    });

    if(!CMO_data){
      return res.status(500).json({ message: "File upload failed" });
    }

    console.log("The cmo: ", CMO_data)
    console.log("The package: ", Package.toLowerCase())
    console.log("data : ", data.length)


     const response = await prisma.targetPackage.updateMany({
      where:{
        cmoTargetId: CMO_data?.id,
        name: Package.toLowerCase()
      },
      data:{
        achieved: {
          increment: data.length
        }
      }
    })
    
    console.log("Response: ", response)
    
    // 8️⃣ Respond with metadata + today's batch
    res.status(200).json({
      message: "Leads uploaded and assigned successfully",
      uploadedFile,
      fileUrl,
      totalLeads: leadsToCreate.length,
    });
  } catch (err) {
    console.error("Error in UploadLeads:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

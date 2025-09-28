import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prismaClient";
import supabase from "../../config/supabase";
import { getSignedUrl } from "../../utils/SupabaseFunction/supabaseFunction";

// export const GetClient = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.user?.user_id;

//     const ClientData: any = await prisma.clients.findMany({
//       where: {
//         Team: {
//           members: {
//             some: {
//               profile: {
//                 user_id: userId,
//               },
//             },
//           },
//         },
//       },
//       select: {
//         id: true,
//         company_name: true,
//         Content: true,
//       },
//     });
//     console.log(ClientData);

//     await Promise.all(
//       ClientData.map(async (client: any) => {
//         if (client.Content) {
//           await Promise.all(
//             client.Content.map(async (item: any) => {
//               if (item.documentUrl) {
//                 item.documentUrl = await getSignedUrl(item.documentUrl);
//               }
//               return item;
//             })
//           );
//         }
//         return client;
//       })
//     );

//     res.status(200).json(ClientData);
//   } catch (error) {
//     console.error("Error fetching client data:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const GetClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.user_id;

    // Fetch clients assigned to the user and include their MarketingContent
    const clientData = await prisma.clients.findMany({
      where: {
        Team: {
          members: {
            some: {
              profile: {
                user_id: userId,
              },
            },
          },
        },
      },
      // CHANGED: Select MarketingContent instead of Content
      select: {
        id: true,
        company_name: true,
        MarketingContent: {
          // You can add an orderBy here if you want
          orderBy: {
            date: "asc",
          },
        },
      },
    });

    // NOTE: This part is for getting signed URLs for PDFs.
    // If you store PDFs on MarketingContent, you can use this logic.
    // I've commented it out for now as the main goal is displaying the content items.
    /*
    await Promise.all(
      clientData.map(async (client) => {
        if (client.MarketingContent) {
          await Promise.all(
            client.MarketingContent.map(async (item) => {
              if (item.sourcePdf) {
                item.sourcePdf = await getSignedUrl(item.sourcePdf);
              }
              return item;
            })
          );
        }
        return client;
      })
    );
    */

    // The structure is now: [{ id, company_name, MarketingContent: [...] }]
    console.log("client data: ",clientData)
    res.status(200).json(clientData);
  } catch (error) {
    console.error("Error fetching client data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const UploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    const { title, clientId, selectedDate } = req.body;
    const userId = req.user?.user_id;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // upload file

    const filePath = `${clientId}/${Date.now()}-${file.originalname}`;

    const extension = file.originalname.split(".").pop()?.toLowerCase();

    console.log(filePath, extension);

    const { error: uploadFile } = await supabase.storage
      .from("documents")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadFile) {
      console.error("Error uploading file:", uploadFile);
      return res.status(500).json({ error: "Error uploading file" });
    }

    // save the data in the content table

    const profile = await prisma.profiles.findFirst({
      where: { user_id: userId }, // assuming profiles table has user_id column
      select: { id: true },
    });

    if (!profile) throw new Error("Profile not found");

    // Determine document type
    let documentType: "PDF" | "Word" | undefined;

    if (extension === "pdf") {
      documentType = "PDF";
    } else if (extension === "doc" || extension === "docx") {
      documentType = "Word";
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    await prisma.content.create({
      data: {
        title,
        clientId,
        contentWriterId: profile.id, // assign profile ID here
        status: "pending_review",
        start: new Date(selectedDate),
        documentUrl: filePath,
        documentType: documentType,
      },
    });

    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {id} = req.params;
    const {newContent} = req.body;

    await prisma.marketingContent.update({
      where:{
        id: id
      },
      data:{
        content: newContent,
        status: "pending_review",
        reworkComment: null
      }
    })
    res.status(200).json({message: "Update is done"})
  } catch (error) {
    res.status(500).json({message: "Error in adding data", error: error})
  }
}

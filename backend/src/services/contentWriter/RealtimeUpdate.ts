import supabase from "../../config/supabase";
import prisma from "../../lib/prismaClient";
import {
  fetchDesignerTasks,
  processAndStoreMarketingContent,
} from "../../utils/ClientSide/ClientFunctionality";

export const NewContentFunctionality = async () => {
  const channel = supabase.channel("Content-Functionality");

  channel.on(
    "postgres_changes",
    {
      event: "INSERT", // Listen for INSERT, UPDATE, DELETE
      schema: "public",
      table: "Content",
    },
    (payload) => {
      console.log("🚀 Backend detected change on Content:", payload);

      processAndStoreMarketingContent(payload);

      // --- You can add any backend logic here ---
      // For example: log the change, send a Slack notification, etc.
      // ------------------------------------------

      // 2. After processing, broadcast a custom message to all clients.
      console.log("📢 Broadcasting 'leads_updated' event to all clients...");
      channel.send({
        type: "broadcast",
        event: "leads_updated", // This is our custom event name
        payload: {
          message: "The leads data has been modified.",
          content: payload.new,
        }, // You can send any data you want
      });
    }
  );

  channel.subscribe((status, err) => {
    if (status === "SUBSCRIBED") {
      console.log("✅ Backend successfully subscribed to lead changes!");
    }
    if (status === "CHANNEL_ERROR") {
      console.error("❌ Backend error subscribing to lead changes:", err);
    }
  });

  return channel;
};

export const ContentStatusChanged = async () => {
  const channel = supabase.channel("content-status-changed");

  channel
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "Content",
        // ✅ THIS IS THE KEY: The listener will only fire if the 'status' column
        // of an updated row is EQUAL to 'approved'.
        filter: "status=eq.approved",
      },
      async (payload) => {
        // This code now ONLY runs when a Content batch is fully approved.
        console.log("✅ A content batch was just approved!", payload.new);

        console.log("✅ A content batch was approved:", payload.new);

        // 1. Get the Client ID from the approved content
        const clientId = payload.new.clientId;
        if (!clientId) {
          console.error("Error: clientId not found in the payload.");
          return;
        }

        try {
          // 2. Find the Graphic Designer assigned to this client's team
          const graphicDesigner = await prisma.teamMember.findFirst({
            where: {
              // Their role must be 'Graphic Designer'
              role: "Graphic Designer",
              // And they must be in the team associated with the client
              team: {
                clients: {
                  some: {
                    id: clientId,
                  },
                },
              },
            },
            // Include the profile to get their unique user_id
            include: {
              profile: true,
            },
          });

          if (graphicDesigner && graphicDesigner.profile.user_id) {
            const designerUserId = graphicDesigner.profile.user_id;
            console.log(
              `🎯 Found Graphic Designer. User ID: ${designerUserId}`
            );

            // 3. Construct the private channel name for this specific user
            const privateChannelName = `private-notifications-${designerUserId}`;
            const userChannel = supabase.channel(privateChannelName);

            await userChannel.send({
              type: "broadcast",
              event: "new_task_ready", // A specific event the frontend will listen for
              payload: {
                message: `A new task is ready for client ID: ${clientId}`,
                content: payload.new,
              },
            });

            console.log(
              `📢 Notification sent to channel: ${privateChannelName}`
            );
          } else {
            console.log(
              `⚠️ No Graphic Designer found for client ID: ${clientId}`
            );
          }
        } catch (error) {
          console.error(
            "Failed to query for designer or send notification:",
            error
          );
        }
      }
    )
    .subscribe();
};


// Define the shape of your data
type DesignerSubmission = {
  id: string;
  taskId: string;
  filePath: string;
  fileName: string;
  fileType: string;
  designerId: string;
  createdAt: string;
};

export const SendDataToDigitalMarketer = async () => {
  const channel = supabase.channel("Send-Data-To-Digital-Marketer");

  channel
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "DesignerSubmission",
      },
      async (payload) => {
        console.log("✅ New designer submission received:", payload.new);
        const newSubmission = payload.new as DesignerSubmission;
        const taskId = newSubmission?.taskId;

        if (!taskId) {
          console.error("Error: taskId not found in the payload.");
          return;
        }

        try {
          // 1️⃣ FETCH COMPREHENSIVE DATA IN ONE GO
          // Get the full marketing task details using the taskId from the submission.
          const marketingTask = await prisma.marketingContent.findUnique({
            where: { id: taskId },
          });

          if (!marketingTask) {
            console.error(
              `Error: MarketingContent with ID ${taskId} not found.`
            );
            return;
          }

          const clientId = marketingTask.clientId;

          // 2️⃣ GENERATE A SECURE SIGNED URL FOR THE PRIVATE FILE
          // This creates a temporary, public link to the private file.
          const { data: signedUrlData, error: signedUrlError } =
            await supabase.storage
              // 👇 IMPORTANT: Replace with your actual private bucket name
              .from("designer-uploads")
              .createSignedUrl(newSubmission.filePath, 3600); // URL is valid for 1 hour (3600 seconds)

          if (signedUrlError) {
            console.error(
              "Error generating signed URL:",
              signedUrlError.message
            );
            return;
          }

          // 3️⃣ CONSTRUCT THE NEW, COMBINED PAYLOAD
          // This object contains everything the Digital Marketer needs.
          const notificationPayload = {
            // Data from MarketingContent table
            campaignTitle: marketingTask.campaignTitle,
            date: marketingTask.date,
            hashtags: marketingTask.hashtags,
            marketerGuide: marketingTask.content,
            sourcePdf: marketingTask.sourcePdf,

            // Data from the new DesignerSubmission
            submission: {
              id: newSubmission.id,
              fileName: newSubmission.fileName,
              fileType: newSubmission.fileType,
              // Use the secure, temporary URL instead of the private path
              url: signedUrlData.signedUrl,
            },
          };

          // 4️⃣ FIND THE DIGITAL MARKETER (Your existing logic is correct)
          const digitalMarketer = await prisma.teamMember.findFirst({
            where: {
              role: "Digital Marketer",
              team: {
                clients: {
                  some: { id: clientId },
                },
              },
            },
            include: { profile: true },
          });

          if (digitalMarketer && digitalMarketer.profile.user_id) {
            const marketerUserId = digitalMarketer.profile.user_id;
            const privateChannelName = `private-notifications-${marketerUserId}`;
            const userChannel = supabase.channel(privateChannelName);

            // 5️⃣ SEND THE NEW, COMPREHENSIVE PAYLOAD
            await userChannel.send({
              type: "broadcast",
              event: "designer_viewing_gf", // Use a clear event name
              payload: notificationPayload, // Send our combined data object
            });

            console.log(
              `📢 Notification with signed URL sent to channel: ${privateChannelName}`
            );
          } else {
            console.log(
              `⚠️ No Digital Marketer found for client ID: ${clientId}`
            );
          }
        } catch (error) {
          console.error(
            "Failed to process submission and send notification:",
            error
          );
        }
      }
    )
    .subscribe();
};

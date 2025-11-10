import supabase from "../../config/supabase";
import prisma from "../../lib/prismaClient";
import {
  ensureSupabaseConnected,
  registerRealtimeChannel,
} from "../../lib/realtimeManager";
import {
  fetchDesignerTasks,
  processAndStoreMarketingContent,
} from "../../utils/ClientSide/ClientFunctionality";

export const NewContentFunctionality = async () => {
  let channel: any = [];

  const subscribe = () => {
    if (channel) {
      try {
        if (typeof channel.unsubscribe === "function") {
          console.log("🧹 Unsubscribing old channel safely...");
          channel.unsubscribe(); // ✅ safer direct call
        } else {
          console.log(
            "⚠️ Channel is not active or already removed, skipping cleanup."
          );
        }
      } catch (err: any) {
        console.warn("⚠️ Error during channel cleanup (ignored):", err.message);
      }
    }

    channel = supabase.channel("Content-Functionality");

    channel.on(
      "postgres_changes",
      {
        event: "INSERT", // Listen for INSERT, UPDATE, DELETE
        schema: "public",
        table: "Content",
      },
      (payload: any) => {
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

    channel.subscribe(async (status: string, err: any) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Backend subscribed to lead changes!");
      } else if (
        status === "CHANNEL_ERROR" ||
        status === "CLOSED" ||
        status === "TIMED_OUT"
      ) {
        console.warn(
          `⚠️ Lead changes channel ${status}. Requesting global reconnect...`,
          err || ""
        );
        await ensureSupabaseConnected(); // ✅ Let global manager handle reconnect + resubscribe
      }
    });
  };

  registerRealtimeChannel(subscribe);

  subscribe();

  return channel;
};

export const ContentStatusChanged = async () => {
  let channel: any; // Keep reference for cleanup/retry

  // --- Helper to (re)subscribe safely ---
  const subscribe = () => {
    // 🧹 Remove old channel if it exists
    if (channel) {
      try {
        if (typeof channel.unsubscribe === "function") {
          console.log("🧹 Unsubscribing old channel safely...");
          channel.unsubscribe(); // ✅ safer direct call
        } else {
          console.log(
            "⚠️ Channel is not active or already removed, skipping cleanup."
          );
        }
      } catch (err: any) {
        console.warn("⚠️ Error during channel cleanup (ignored):", err.message);
      }
    }

    console.log("🔗 Subscribing to 'content-status-changed' channel...");
    channel = supabase.channel("content-status-changed");

    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Content",
          filter: "status=eq.approved", // Trigger only when status becomes approved
        },
        async (payload: any) => {
          console.log("✅ Content approved trigger fired!", payload.new);

          const clientId = payload.new.clientId;
          if (!clientId) {
            console.error("❌ Error: clientId not found in payload.");
            return;
          }

          try {
            // 1️⃣ Find the graphic designer for this client’s team
            const graphicDesigner = await prisma.teamMember.findFirst({
              where: {
                role: "Graphic Designer",
                team: { clients: { some: { id: clientId } } },
              },
              include: { profile: true },
            });

            if (graphicDesigner?.profile?.user_id) {
              const designerUserId = graphicDesigner.profile.user_id;
              console.log(`🎨 Found Graphic Designer: ${designerUserId}`);

              // 2️⃣ Send realtime broadcast to designer’s private channel
              const privateChannelName = `private-notifications-${designerUserId}`;
              const userChannel = supabase.channel(privateChannelName);

              await userChannel.send({
                type: "broadcast",
                event: "new_task_ready",
                payload: {
                  message: `A new task is ready for client ID: ${clientId}`,
                  content: payload.new,
                },
              });

              console.log(`📢 Notification sent on ${privateChannelName}`);
            } else {
              console.warn(
                `⚠️ No Graphic Designer found for client ${clientId}`
              );
            }
          } catch (error: any) {
            console.error(
              "❌ Failed to process approved content:",
              error.message || error
            );
          }
        }
      )
      .subscribe(async (status: string, err: any) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Backend subscribed to lead changes!");
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "CLOSED" ||
          status === "TIMED_OUT"
        ) {
          console.warn(
            `⚠️ Lead changes channel ${status}. Requesting global reconnect...`,
            err || ""
          );
          await ensureSupabaseConnected(); // ✅ Let global manager handle reconnect + resubscribe
        }
      });
  };

  // --- Retry helper (5-second delay) ---
  registerRealtimeChannel(subscribe);

  // Start initial subscription
  subscribe();
  return channel;
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
  let channel: any; // Keep channel reference for retry

  // 🔁 Helper to (re)subscribe safely
  const subscribe = () => {
    // 🧹 Remove old channel before resubscribing
    if (channel) {
      try {
        if (typeof channel.unsubscribe === "function") {
          console.log("🧹 Unsubscribing old channel safely...");
          channel.unsubscribe(); // ✅ safer direct call
        } else {
          console.log(
            "⚠️ Channel is not active or already removed, skipping cleanup."
          );
        }
      } catch (err: any) {
        console.warn("⚠️ Error during channel cleanup (ignored):", err.message);
      }
    }

    console.log("🔗 Subscribing to 'Send-Data-To-Digital-Marketer' channel...");
    channel = supabase.channel("Send-Data-To-Digital-Marketer");

    channel
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "DesignerSubmission",
        },
        async (payload: any) => {
          console.log("✅ New designer submission received:", payload.new);

          const newSubmission = payload.new as DesignerSubmission;
          const taskId = newSubmission?.taskId;

          if (!taskId) {
            console.error("❌ taskId not found in payload.");
            return;
          }

          try {
            // 1️⃣ Fetch associated marketing content
            const marketingTask = await prisma.marketingContent.findUnique({
              where: { id: taskId },
            });

            if (!marketingTask) {
              console.error(`❌ No MarketingContent found for ID ${taskId}`);
              return;
            }

            const clientId = marketingTask.clientId;

            // 2️⃣ Generate signed URL for designer’s uploaded file
            const { data: signedUrlData, error: signedUrlError } =
              await supabase.storage
                .from("designer-uploads")
                .createSignedUrl(newSubmission.filePath, 3600); // valid for 1 hour

            if (signedUrlError || !signedUrlData?.signedUrl) {
              console.error(
                "❌ Failed to generate signed URL:",
                signedUrlError?.message
              );
              return;
            }

            // 3️⃣ Construct payload for the digital marketer
            const notificationPayload = {
              campaignTitle: marketingTask.campaignTitle,
              date: marketingTask.date,
              hashtags: marketingTask.hashtags,
              marketerGuide: marketingTask.content,
              sourcePdf: marketingTask.sourcePdf,
              submission: {
                id: newSubmission.id,
                fileName: newSubmission.fileName,
                fileType: newSubmission.fileType,
                url: signedUrlData.signedUrl,
              },
            };

            // 4️⃣ Find the digital marketer assigned to this client
            const digitalMarketer = await prisma.teamMember.findFirst({
              where: {
                role: "Digital Marketer",
                team: { clients: { some: { id: clientId } } },
              },
              include: { profile: true },
            });

            if (digitalMarketer?.profile?.user_id) {
              const marketerUserId = digitalMarketer.profile.user_id;
              const privateChannelName = `private-notifications-${marketerUserId}`;
              const userChannel = supabase.channel(privateChannelName);

              // 5️⃣ Send notification with signed URL
              await userChannel.send({
                type: "broadcast",
                event: "designer_submission_ready", // more descriptive event name
                payload: notificationPayload,
              });

              console.log(
                `📢 Notification with signed URL sent to channel: ${privateChannelName}`
              );
            } else {
              console.warn(
                `⚠️ No Digital Marketer found for client ${clientId}`
              );
            }
          } catch (err: any) {
            console.error(
              "❌ Failed to process submission & send notification:",
              err.message || err
            );
          }
        }
      )
      .subscribe(async (status: string, err: any) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Backend subscribed to lead changes!");
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "CLOSED" ||
          status === "TIMED_OUT"
        ) {
          console.warn(
            `⚠️ Lead changes channel ${status}. Requesting global reconnect...`,
            err || ""
          );
          await ensureSupabaseConnected(); // ✅ Let global manager handle reconnect + resubscribe
        }
      });
  };

  registerRealtimeChannel(subscribe);

  // Start initial subscription
  subscribe();
  return channel;
};

import supabase from "../../config/supabase";
import {
  ensureSupabaseConnected,
  registerRealtimeChannel,
} from "../../lib/realtimeManager";

export function listenForBusinessDeveloperChanges() {
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
    channel = supabase.channel("BD-changes-channel");

    // 1. Backend listens for ANY change on the TelecommunicatorLeads table.
    channel.on(
      "postgres_changes",
      {
        event: "*", // Listen for INSERT, UPDATE, DELETE
        schema: "public",
        table: "BussinessDeveloper",
      },
      (payload: any) => {
        console.log(
          "🚀 Backend detected change on Business Developer:",
          payload
        );

        // --- You can add any backend logic here ---
        // For example: log the change, send a Slack notification, etc.
        // ------------------------------------------

        // 2. After processing, broadcast a custom message to all clients.
        console.log("📢 Broadcasting 'New lead' event to all clients...");
        channel.send({
          type: "broadcast",
          event: "new_lead", // This is our custom event name
          payload: { message: "The new lead is added." }, // You can send any data you want
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
}

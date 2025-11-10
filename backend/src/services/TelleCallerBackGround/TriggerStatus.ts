import supabase from "../../config/supabase";
import {
  ensureSupabaseConnected,
  registerRealtimeChannel,
} from "../../lib/realtimeManager";

export function listenForLeadChanges() {
  let channel: any;

  function subscribeToChannel() {
    // 🧹 cleanup
    if (channel) {
      try {
        if (typeof channel.unsubscribe === "function") {
          console.log("🧹 Unsubscribing old 'lead-changes' channel...");
          channel.unsubscribe();
        } else {
          console.log("⚠️ Channel not active or already removed.");
        }
      } catch (err: any) {
        console.warn("⚠️ Cleanup error (ignored):", err.message);
      }
    }

    console.log("🔗 Subscribing to lead changes channel...");

    channel = supabase.channel("lead-changes-channel");

    // 1️⃣ Listen to any insert/update/delete event
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "TelecommunicatorLeads",
      },
      (payload: any) => {
        console.log("📢 Broadcasting 'leads_updated' event...");
        channel.send({
          type: "broadcast",
          event: "leads_updated",
          payload: { message: "The leads data has been modified." },
        });
      }
    );

    // 2️⃣ Handle subscription status
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
  }

  // Register this channel for future resubscriptions after reconnect
  registerRealtimeChannel(subscribeToChannel);

  // Initial subscription
  subscribeToChannel();

  return channel;
}

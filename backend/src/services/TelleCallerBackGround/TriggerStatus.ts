import supabase from "../../config/supabase";

export function listenForLeadChanges() {
  const channel = supabase.channel("lead-changes-channel");

  // 1. Backend listens for ANY change on the TelecommunicatorLeads table.
  channel.on(
    "postgres_changes",
    {
      event: "*", // Listen for INSERT, UPDATE, DELETE
      schema: "public",
      table: "TelecommunicatorLeads",
    },
    (payload) => {
      console.log(
        "🚀 Backend detected change on TelecommunicatorLeads:",
        payload
      );

      // --- You can add any backend logic here ---
      // For example: log the change, send a Slack notification, etc.
      // ------------------------------------------

      // 2. After processing, broadcast a custom message to all clients.
      console.log("📢 Broadcasting 'leads_updated' event to all clients...");
      channel.send({
        type: "broadcast",
        event: "leads_updated", // This is our custom event name
        payload: { message: "The leads data has been modified." }, // You can send any data you want
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
}

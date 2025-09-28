import supabase from "../../config/supabase";

export function listenForBusinessDeveloperChanges() {
  const channel = supabase.channel("BD-changes-channel");

  // 1. Backend listens for ANY change on the TelecommunicatorLeads table.
  channel.on(
    "postgres_changes",
    {
      event: "*", // Listen for INSERT, UPDATE, DELETE
      schema: "public",
      table: "BussinessDeveloper",
    },
    (payload) => {
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

  channel.subscribe((status, err) => {
    if (status === "SUBSCRIBED") {
      console.log("✅ Backend successfully subscribed to New lead");
    }
    if (status === "CHANNEL_ERROR") {
      console.error("❌ Backend error subscribing to lead changes:", err);
    }
  });

  return channel;
}
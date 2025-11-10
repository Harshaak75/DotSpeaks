import supabase from "../config/supabase";
import dns from "dns";

let isReconnecting = false;
let subscribers: (() => void)[] = []; // all channel resubscribe functions

// Add listeners that want to auto-resubscribe after reconnect
export function registerRealtimeChannel(resubscribeFn: () => void) {
  subscribers.push(resubscribeFn);
}

// Simple check for internet connectivity
async function internetIsBack(): Promise<boolean> {
  return new Promise((resolve) => {
    dns.lookup("supabase.io", (err) => resolve(!err));
  });
}

// Central reconnection logic
export async function ensureSupabaseConnected() {
  if (isReconnecting) return;
  isReconnecting = true;

  console.log("🔁 [Global] Checking Supabase Realtime connection...");

  const state = supabase.realtime.connectionState();
  if (state === "open") {
    console.log("✅ [Global] Supabase already connected.");
    isReconnecting = false;
    return;
  }

  const online = await internetIsBack();
  if (!online) {
    console.log("🌐 [Global] Internet still offline, retrying in 10s...");
    isReconnecting = false;
    setTimeout(ensureSupabaseConnected, 10000);
    return;
  }

  try {
    console.warn(`⚠️ [Global] Supabase state = ${state}. Reconnecting socket...`);
    await supabase.realtime.disconnect();
    await supabase.realtime.connect();

    console.log("✅ [Global] Supabase socket reconnected!");

    // Re-subscribe all registered channels once
    for (const fn of subscribers) {
      console.log("🔄 [Global] Re-subscribing channel...");
      fn();
    }
  } catch (err: any) {
    console.error("❌ [Global] Failed to reconnect:", err.message || err);
  } finally {
    isReconnecting = false;
  }
}

// WorkCountdown.tsx
import React, { useEffect, useState, useRef } from "react";

interface WorkCountdownProps {
  /** seconds to countdown from; default 8 hours (8*3600). Pass 60 for quick testing */
  initialSeconds?: number;
  /** external paused boolean (controlled by parent). When true, timer is paused. */
  paused?: boolean;
  /** called once when overtime starts (remaining <= 0) */
  onOvertime?: () => void;
  /** start the timer automatically (default true) */
  autoStart?: boolean;
}



const pad2 = (n: number) => n.toString().padStart(2, "0");

const formatHMS = (totalSec: number) => {
  const abs = Math.abs(Math.floor(totalSec));
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
};

type SavedState = {
  remaining: number;
  running: boolean;
  lastUpdated: number; // unix ms
  initialSeconds: number;
};

const STORAGE_KEY = "WorkStoragev1"
const st = import.meta.env.STORAGE_KEY;
console.log("The time storage value: ",localStorage.getItem(st))

const safeLoad = (initialSeconds: number): SavedState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedState;
    // if initialSeconds changed (different build / test) ignore saved state
    if (typeof parsed.initialSeconds !== "number" || parsed.initialSeconds !== initialSeconds) {
      return null;
    }
    if (typeof parsed.remaining !== "number" || typeof parsed.running !== "boolean" || typeof parsed.lastUpdated !== "number") {
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn("WorkCountdown: failed to parse saved state, ignoring.", e);
    return null;
  }
};

const safeSave = (s: SavedState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    // storage might be full or blocked — fail silently
    console.warn("WorkCountdown: failed to save state", e);
  }
};

const WorkCountdown: React.FC<WorkCountdownProps> = ({
  initialSeconds = 8 * 3600,
  paused = false,
  onOvertime,
  autoStart = true,
}) => {
  const saved = safeLoad(initialSeconds);

  // compute initial remaining based on saved value (and elapsed time if it was running)
  const computeInitialRemaining = (): number => {
    if (!saved) return initialSeconds;
    // If saved.running was true, compute elapsed since lastUpdated
    if (saved.running) {
      const elapsedMs = Date.now() - saved.lastUpdated;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      return saved.remaining - elapsedSec;
    }
    // paused previously -> restore exact remaining
    return saved.remaining;
  };

  const [remaining, setRemaining] = useState<number>(() => computeInitialRemaining());
  const [running, setRunning] = useState<boolean>(() => {
    // if parent is paused on mount we honor that; otherwise if saved exists use it; else autoStart
    if (paused) return false;
    if (saved) return saved.running;
    return autoStart;
  });

  const overtimeFired = useRef(false);
  const intervalRef = useRef<number | null>(null);

  // Ensure we don't hold a stale saved flag: if the restored remaining is already <=0
  useEffect(() => {
    if (remaining <= 0) {
      overtimeFired.current = true;
    }
  }, []); // run once on mount

  // sync running with paused prop
  useEffect(() => {
    if (paused) {
      setRunning(false);
    } else {
      // resume only if autoStart or saved running was true; otherwise keep running true to allow auto-resume
      setRunning(true);
    }
  }, [paused]);

  // interval
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Save state right away when paused/stopped
      safeSave({
        remaining,
        running: false,
        lastUpdated: Date.now(),
        initialSeconds,
      });
      return;
    }

    // start interval
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);

    // save state on start
    safeSave({
      remaining,
      running: true,
      lastUpdated: Date.now(),
      initialSeconds,
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]); // intentionally only depend on running

  // persist remaining periodically and when it changes
  useEffect(() => {
    safeSave({
      remaining,
      running,
      lastUpdated: Date.now(),
      initialSeconds,
    });
  }, [remaining, running, initialSeconds]);

  // detect overtime entry once
  useEffect(() => {
    if (remaining <= 0 && !overtimeFired.current) {
      overtimeFired.current = true;
      // call parent callback — parent can call API here
      try {
        onOvertime?.();
      } catch (e) {
        console.error("WorkCountdown: onOvertime handler threw:", e);
      }
      // continue counting into negative numbers to show overtime
    }
  }, [remaining, onOvertime]);

  // if saved state removed or invalid and remaining is NaN guard
  useEffect(() => {
    if (!Number.isFinite(remaining)) {
      setRemaining(initialSeconds);
    }
  }, [initialSeconds, remaining]);

  const isOvertime = remaining <= 0;
  const display = isOvertime ? `${formatHMS(-remaining)}` : formatHMS(remaining);
  const timeColor = isOvertime ? "text-[#d70707]" : "text-[#0000cc]";

  return (
    <div className="flex items-center space-x-4">
      <div className="flex flex-col items-start">
        <div
          className={`text-xl md:text-xl lg:text-[1.25rem] font-extrabold tracking-wide ${timeColor}`}
          style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.02em" }}
          aria-live="polite"
        >
          {display}
        </div>

        <div className="text-[0.8rem] font-semibold text-gray-500" style={{ fontFamily: "Roboto, sans-serif" }}>
          {isOvertime ? "Overtime active" : "Work time remaining"}
        </div>
      </div>

      {/* reserved small spacer where you can place an API status / icon if needed */}
      <div className="hidden md:block w-6" aria-hidden />
    </div>
  );
};

export default WorkCountdown;

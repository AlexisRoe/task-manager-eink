import { useEffect, useState } from "react";
import { NOW_TICK_MS } from "@/config/app.config";

/** Returns the current moment and refreshes it periodically so "today" and the clock stay live. */
export function useNow(tickMs: number = NOW_TICK_MS): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);
  return now;
}

import { useEffect, useState } from "react";
import { STANDALONE_QUERY } from "@/config/pwa.config";

/** Result of checking how the app is being displayed. */
export type DisplayState = "ok" | "not-standalone";

function readState(enforce: boolean): DisplayState {
  if (!enforce) return "ok";
  const navigatorStandalone = (navigator as Navigator & { standalone?: boolean }).standalone;
  const standalone = window.matchMedia(STANDALONE_QUERY).matches || navigatorStandalone === true;
  return standalone ? "ok" : "not-standalone";
}

/**
 * Reports whether the app is shown installed; `enforce = false` always reports `ok` so
 * development is not blocked.
 */
export function useDisplayState(enforce: boolean): DisplayState {
  const [state, setState] = useState<DisplayState>(() => readState(enforce));
  useEffect(() => {
    const update = () => setState(readState(enforce));
    const query = window.matchMedia(STANDALONE_QUERY);
    query.addEventListener("change", update);
    update();
    return () => query.removeEventListener("change", update);
  }, [enforce]);
  return state;
}

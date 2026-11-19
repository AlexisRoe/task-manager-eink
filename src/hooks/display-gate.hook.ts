import { useEffect, useState } from "react";
import { PORTRAIT_QUERY, STANDALONE_QUERY } from "@/config/pwa.config";

/** Result of checking how the app is being displayed. */
export type DisplayState = "ok" | "not-standalone" | "portrait";

function readState(enforce: boolean): DisplayState {
  if (!enforce) return "ok";
  const navigatorStandalone = (navigator as Navigator & { standalone?: boolean }).standalone;
  const standalone = window.matchMedia(STANDALONE_QUERY).matches || navigatorStandalone === true;
  if (!standalone) return "not-standalone";
  return window.matchMedia(PORTRAIT_QUERY).matches ? "portrait" : "ok";
}

/**
 * Reports whether the app is shown installed and in landscape; `enforce = false` always reports
 * `ok` so development is not blocked.
 */
export function useDisplayState(enforce: boolean): DisplayState {
  const [state, setState] = useState<DisplayState>(() => readState(enforce));
  useEffect(() => {
    const update = () => setState(readState(enforce));
    const queries = [window.matchMedia(STANDALONE_QUERY), window.matchMedia(PORTRAIT_QUERY)];
    for (const query of queries) query.addEventListener("change", update);
    update();
    return () => {
      for (const query of queries) query.removeEventListener("change", update);
    };
  }, [enforce]);
  return state;
}

import { useSyncExternalStore } from "react";
import { PORTRAIT_QUERY } from "@/config/pwa.config";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(PORTRAIT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(PORTRAIT_QUERY).matches;
}

/** Reports whether the device is currently held in portrait, updating when it rotates. */
export function useIsPortrait(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}

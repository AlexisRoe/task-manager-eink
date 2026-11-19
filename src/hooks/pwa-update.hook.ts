import { useRegisterSW } from "virtual:pwa-register/react";

/** State of the service-worker update flow. */
export interface PwaUpdate {
  /** True when a new version is installed and waiting. */
  updateAvailable: boolean;
  /** Activates the waiting version and reloads the app. */
  applyUpdate: () => void;
}

/** Registers the service worker and exposes whether the user can reload into a newer version. */
export function usePwaUpdate(): PwaUpdate {
  const {
    needRefresh: [updateAvailable],
    updateServiceWorker,
  } = useRegisterSW();
  return { updateAvailable, applyUpdate: () => void updateServiceWorker(true) };
}

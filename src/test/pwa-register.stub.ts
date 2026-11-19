import { useState } from "react";

/** Test double for `virtual:pwa-register/react`; reports no pending update. */
export function useRegisterSW() {
  const needRefresh = useState(false);
  return {
    needRefresh,
    offlineReady: useState(false),
    updateServiceWorker: async () => {},
  };
}

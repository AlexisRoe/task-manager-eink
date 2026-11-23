import {
  SERVICE_WORKER_POLICY,
  SERVICE_WORKER_URL,
  UPDATE_CHECK_INTERVAL_MS,
} from "@/config/pwa.config";

interface ScriptUrlPolicy {
  createScriptURL: (input: string) => string;
}

/** Builds the script URL for registration; the CSP requires a Trusted Types value where supported. */
function trustedWorkerUrl(): string {
  const factory = (
    globalThis as {
      trustedTypes?: {
        createPolicy: (name: string, rules: ScriptUrlPolicy) => ScriptUrlPolicy;
      };
    }
  ).trustedTypes;
  if (!factory) return SERVICE_WORKER_URL;
  const policy = factory.createPolicy(SERVICE_WORKER_POLICY, {
    createScriptURL(input) {
      if (input !== SERVICE_WORKER_URL) throw new TypeError("Unexpected service worker URL");
      return input;
    },
  });
  return policy.createScriptURL(SERVICE_WORKER_URL);
}

/**
 * Registers the service worker as soon as the app starts, independent of any display gate, so the
 * app is cached for offline use after the first visit. New versions install and activate on their
 * own and the page reloads once; updates are looked for periodically and when connectivity returns.
 */
export async function registerServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const container = navigator.serviceWorker;
  const hadController = container.controller !== null;
  let reloading = false;
  container.addEventListener("controllerchange", () => {
    if (!hadController || reloading) return;
    reloading = true;
    window.location.reload();
  });

  try {
    const registration = await container.register(trustedWorkerUrl() as string, { scope: "/" });
    const checkForUpdate = () => {
      if (navigator.onLine) void registration.update().catch(() => {});
    };
    window.addEventListener("online", checkForUpdate);
    setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);
  } catch {
    // Offline support is best-effort; the app keeps working online without it.
  }
}

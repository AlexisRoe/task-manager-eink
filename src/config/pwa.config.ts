/** Whether the app refuses to run outside an installed standalone window (production only). */
export const ENFORCE_STANDALONE = import.meta.env.PROD;

/** Media query that is true when the app runs as an installed PWA. */
export const STANDALONE_QUERY = "(display-mode: standalone)";

/** Media query that is true while the device is held in portrait. */
export const PORTRAIT_QUERY = "(orientation: portrait)";

/** Path of the generated service worker; the only script URL the Trusted Types policy accepts. */
export const SERVICE_WORKER_URL = "/sw.js";

/** Name of the Trusted Types policy used to register the service worker. */
export const SERVICE_WORKER_POLICY = "daybook-service-worker";

/** How often a running app asks the server whether a newer version exists. */
export const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/** How long the update check waits for the new worker to start installing, in milliseconds. */
export const UPDATE_SETTLE_MS = 1500;

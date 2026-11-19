/** Whether the app refuses to run outside an installed standalone window (production only). */
export const ENFORCE_STANDALONE = import.meta.env.PROD;

/** Media query that is true when the app runs as an installed PWA. */
export const STANDALONE_QUERY = "(display-mode: standalone)";

/** Media query that is true while the device is held in portrait. */
export const PORTRAIT_QUERY = "(orientation: portrait)";

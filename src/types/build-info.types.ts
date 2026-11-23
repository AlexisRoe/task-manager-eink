declare global {
  /** `version` from package.json, injected at build time. */
  const __APP_VERSION__: string;
  /** Short git commit hash of the build, or `unknown`. */
  const __APP_COMMIT__: string;
  /** Build date as `YYYY-MM-DD` (UTC). */
  const __APP_BUILD_DATE__: string;
}

export {};

# 0019. About dialog and build info

Date: 2026-11-23 · Status: accepted

## Context
There was no way to see which version of the installed PWA is running, nor to ask for a newer one: the service worker only checks hourly and on reconnect (ADR on updates, `registerServiceWorker`).

## Decision
- **Tapping "Daybook" in the header opens an About dialog** with name, version, build commit and build date, and a "Check for updates" button next to "Close". Version, commit and date are stacked vertically, label above value, so the dialog stays narrow in portrait.
- **Build info is injected at build time** through Vite `define` (`__APP_VERSION__`, `__APP_COMMIT__`, `__APP_BUILD_DATE__`), read from `package.json` and `git rev-parse --short HEAD` (`unknown` without git). It is exposed via `config/build.config.ts`. No runtime request, no new dependency.
- **Manual update check** (`checkForUpdate` in `utils/service-worker.utils.ts`) calls `registration.update()`. A newer worker installs and activates on its own, and the existing `controllerchange` handler reloads the page; the dialog only reports "installing", "latest version", "offline" or "unsupported".

## Consequences
The date is the UTC build date, not a timestamp. The commit is only as accurate as the checkout CI builds from. The header brand is now a button, so it uses the lib's `Button.Naked` instead of `Title`.

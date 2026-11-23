import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SERVICE_WORKER_URL,
  UPDATE_CHECK_INTERVAL_MS,
  UPDATE_SETTLE_MS,
} from "@/config/pwa.config";
import { checkForUpdate, registerServiceWorker } from "./service-worker.utils";

function stubServiceWorker(update: () => Promise<void>) {
  const register = vi.fn().mockResolvedValue({ update });
  vi.stubGlobal("navigator", {
    onLine: true,
    serviceWorker: { controller: null, register, addEventListener: vi.fn() },
  });
  return register;
}

describe("registerServiceWorker", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("registers the worker at the root scope", async () => {
    const register = stubServiceWorker(async () => {});
    await registerServiceWorker();
    expect(register).toHaveBeenCalledWith(SERVICE_WORKER_URL, { scope: "/" });
  });

  it("checks for updates when connectivity returns and on an interval", async () => {
    vi.useFakeTimers();
    const update = vi.fn().mockResolvedValue(undefined);
    stubServiceWorker(update);
    await registerServiceWorker();

    window.dispatchEvent(new Event("online"));
    expect(update).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(UPDATE_CHECK_INTERVAL_MS);
    expect(update).toHaveBeenCalledTimes(2);
  });

  it("does nothing without service worker support", async () => {
    vi.stubGlobal("navigator", {});
    await expect(registerServiceWorker()).resolves.toBeUndefined();
  });

  it("swallows registration failures", async () => {
    vi.stubGlobal("navigator", {
      serviceWorker: {
        controller: null,
        register: vi.fn().mockRejectedValue(new Error("blocked")),
        addEventListener: vi.fn(),
      },
    });
    await expect(registerServiceWorker()).resolves.toBeUndefined();
  });
});

describe("checkForUpdate", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function stubRegistration(registration: object | undefined, onLine = true) {
    vi.stubGlobal("navigator", {
      onLine,
      serviceWorker: { getRegistration: vi.fn().mockResolvedValue(registration) },
    });
  }

  it("reports a new version that starts installing", async () => {
    vi.useFakeTimers();
    stubRegistration({
      update: vi.fn().mockResolvedValue(undefined),
      installing: {},
      waiting: null,
    });
    const result = checkForUpdate();
    await vi.advanceTimersByTimeAsync(UPDATE_SETTLE_MS);
    await expect(result).resolves.toBe("installing");
  });

  it("reports the current version when nothing new is found", async () => {
    vi.useFakeTimers();
    stubRegistration({
      update: vi.fn().mockResolvedValue(undefined),
      installing: null,
      waiting: null,
    });
    const result = checkForUpdate();
    await vi.advanceTimersByTimeAsync(UPDATE_SETTLE_MS);
    await expect(result).resolves.toBe("current");
  });

  it("reports offline and unsupported states", async () => {
    stubRegistration({}, false);
    await expect(checkForUpdate()).resolves.toBe("offline");
    stubRegistration(undefined);
    await expect(checkForUpdate()).resolves.toBe("unsupported");
    vi.stubGlobal("navigator", {});
    await expect(checkForUpdate()).resolves.toBe("unsupported");
  });
});

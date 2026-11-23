import { afterEach, describe, expect, it, vi } from "vitest";
import { SERVICE_WORKER_URL, UPDATE_CHECK_INTERVAL_MS } from "@/config/pwa.config";
import { registerServiceWorker } from "./service-worker.utils";

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

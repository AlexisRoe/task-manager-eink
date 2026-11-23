import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/app.component";
import { registerServiceWorker } from "@/utils/service-worker.utils";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void registerServiceWorker();
void navigator.storage?.persist?.();

if (import.meta.env.DEV) {
  void Promise.all([import("@/dev/seed.fixture"), import("@/store/tasks.store")]).then(
    ([{ seedDemoDataWhenEmpty }, { useTasksStore }]) => seedDemoDataWhenEmpty(useTasksStore),
  );
}

import type { ReactNode } from "react";
import { NOTIFICATION_DURATION_MS } from "@/config/app.config";
import { ModalProvider, NotificationProvider, ThemeProvider } from "@/ui";

/** Wraps children in the theme, modal and notification providers every screen depends on. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <NotificationProvider duration={NOTIFICATION_DURATION_MS}>
        <ModalProvider>{children}</ModalProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

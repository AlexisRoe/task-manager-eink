import type { ReactNode } from "react";
import { ENFORCE_STANDALONE } from "@/config/pwa.config";
import { useDisplayState } from "@/hooks/display-gate.hook";
import { Alert, Text, Title } from "@/ui";

/** Props of {@link StandaloneGate}. */
export interface StandaloneGateProps {
  children: ReactNode;
  /** Whether to enforce standalone and landscape; defaults to production-only enforcement. */
  enforce?: boolean;
}

/**
 * Lets the app render only when it runs as an installed, landscape PWA; otherwise explains how
 * to install it or asks to rotate the device.
 */
export function StandaloneGate({ children, enforce = ENFORCE_STANDALONE }: StandaloneGateProps) {
  const state = useDisplayState(enforce);

  if (state === "ok") return <>{children}</>;

  return (
    <main className="app-gate">
      <Title size="2">Daybook</Title>
      {state === "not-standalone" ? (
        <>
          <Alert
            variant="info"
            icon="info-circle"
            title="Install Daybook to use it"
            description="Daybook runs as an installed app only."
          />
          <Text>
            Open your browser menu, choose "Install app" or "Add to Home Screen", then start Daybook
            from your home screen.
          </Text>
        </>
      ) : (
        <Alert
          variant="info"
          icon="refresh"
          title="Rotate your device"
          description="Daybook is designed for landscape orientation."
        />
      )}
    </main>
  );
}

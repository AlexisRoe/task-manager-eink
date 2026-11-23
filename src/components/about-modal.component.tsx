import { useState } from "react";
import { APP_BUILD_DATE, APP_COMMIT, APP_NAME, APP_VERSION } from "@/config/build.config";
import { Label, Modal, Text } from "@/ui";
import { checkForUpdate, type UpdateCheckResult } from "@/utils/service-worker.utils";

/** Props of {@link AboutModal}. */
export interface AboutModalProps {
  onClose: () => void;
}

const UPDATE_MESSAGES: Record<UpdateCheckResult | "checking", string> = {
  checking: "Checking for updates…",
  installing: "New version found. Installing, the app reloads in a moment.",
  current: "You are on the latest version.",
  offline: "Could not reach the server. Try again when you are online.",
  unsupported: "Updates are not available in this environment.",
};

/** About dialog: product name, version, build commit and date, plus an on-demand update check. */
export function AboutModal({ onClose }: AboutModalProps) {
  const [status, setStatus] = useState<UpdateCheckResult | "checking" | null>(null);

  const check = () => {
    setStatus("checking");
    void checkForUpdate().then(setStatus);
  };

  return (
    <Modal open title={APP_NAME} onClosed={onClose} onAccept={check}>
      <Modal.Close />
      <div className="about-modal">
        <div>
          <Label>VERSION</Label>
          <Text>{APP_VERSION}</Text>
        </div>
        <div>
          <Label>COMMIT</Label>
          <Text>{APP_COMMIT}</Text>
        </div>
        <div>
          <Label>BUILT</Label>
          <Text>{APP_BUILD_DATE}</Text>
        </div>
      </div>
      <Text role="status">{status === null ? "" : UPDATE_MESSAGES[status]}</Text>
      <Modal.CloseButton>Close</Modal.CloseButton>
      <Modal.ActionButton disabled={status === "checking"}>Check for updates</Modal.ActionButton>
    </Modal>
  );
}

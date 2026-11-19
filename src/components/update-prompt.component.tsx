import { usePwaUpdate } from "@/hooks/pwa-update.hook";
import { Alert, Button } from "@/ui";

/** Banner offering to reload when a new version of the app is ready. */
export function UpdatePrompt() {
  const { updateAvailable, applyUpdate } = usePwaUpdate();
  if (!updateAvailable) return null;
  return (
    <div className="app__notice">
      <Alert variant="info" icon="refresh" title="A new version is available" />
      <Button onClick={applyUpdate}>Reload</Button>
    </div>
  );
}

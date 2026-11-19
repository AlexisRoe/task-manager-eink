import "./app.css";
import { AppHeader } from "@/components/app-header.component";
import { ModalHost } from "@/components/modal-host.component";
import { UpdatePrompt } from "@/components/update-prompt.component";
import { useTasksHydrated } from "@/hooks/tasks-hydration.hook";
import { useTasksStore } from "@/store/tasks.store";
import { useUiStore } from "@/store/ui.store";
import { Alert, Button } from "@/ui";
import { DayView } from "@/views/day/day.view";
import { HistoryView } from "@/views/history/history.view";
import { WeekView } from "@/views/week/week.view";
import { AppProviders } from "./app-providers.component";
import { StandaloneGate } from "./standalone-gate.component";

/** Root of the planner: providers, display gate, header and the active view. */
export function App() {
  return (
    <AppProviders>
      <StandaloneGate>
        <Planner />
      </StandaloneGate>
    </AppProviders>
  );
}

function Planner() {
  const hydrated = useTasksHydrated();
  const view = useUiStore((state) => state.view);
  const recovered = useTasksStore((state) => state.recoveredFromCorruption);
  const acknowledge = useTasksStore((state) => state.acknowledgeRecovery);

  if (!hydrated) return null;

  return (
    <div className="app">
      <AppHeader />
      {recovered ? (
        <div className="app__notice">
          <Alert
            variant="warning"
            icon="alert-triangle"
            title="Stored data could not be read"
            description="It has been reset so the app keeps working."
          />
          <Button.Outlined onClick={acknowledge}>Dismiss</Button.Outlined>
        </div>
      ) : null}
      <ModalHost />
      <UpdatePrompt />
      <main className="app__main">
        {view === "day" ? <DayView /> : null}
        {view === "week" ? <WeekView /> : null}
        {view === "history" ? <HistoryView /> : null}
      </main>
    </div>
  );
}

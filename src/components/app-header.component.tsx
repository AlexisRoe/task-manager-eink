import { DateNav } from "@/components/date-nav.component";
import { APP_NAME } from "@/config/build.config";
import { HABITS_MAX_ACTIVE } from "@/constants/habit.constants";
import { useActiveHabitCount } from "@/hooks/habits.hook";
import { useUiStore } from "@/store/ui.store";
import type { ViewName } from "@/types/view.types";
import { Button, Segmented } from "@/ui";

const VIEWS: readonly { id: ViewName; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "history", label: "History" },
  { id: "stats", label: "Stats" },
];

const isViewName = (value: string): value is ViewName => VIEWS.some((view) => view.id === value);

/** Brand, view switch, date navigation and the "New habit" / "New task" actions. */
export function AppHeader() {
  const view = useUiStore((state) => state.view);
  const setView = useUiStore((state) => state.setView);
  const openModal = useUiStore((state) => state.openModal);
  const habitsFull = useActiveHabitCount() >= HABITS_MAX_ACTIVE;

  return (
    <header className="app-header">
      <Button.Naked
        className="app-header__brand"
        size="xl"
        aria-label={`About ${APP_NAME}`}
        onClick={() => openModal({ kind: "about" })}
      >
        {APP_NAME}
      </Button.Naked>
      <Segmented
        value={view}
        onChange={(id) => {
          if (isViewName(id)) setView(id);
        }}
        aria-label="View"
      >
        {VIEWS.map(({ id, label }) => (
          <Segmented.Item key={id} id={id}>
            {label}
          </Segmented.Item>
        ))}
      </Segmented>
      <div className="app-header__nav">
        {view === "history" || view === "stats" ? null : <DateNav />}
      </div>
      <div className="app-header__actions">
        <Button.Outlined
          iconLeft="plus"
          disabled={habitsFull}
          title={
            habitsFull ? `${HABITS_MAX_ACTIVE} of ${HABITS_MAX_ACTIVE} habits active` : undefined
          }
          onClick={() => openModal({ kind: "new-habit" })}
        >
          New habit
        </Button.Outlined>
        <Button iconLeft="plus" onClick={() => openModal({ kind: "new-task" })}>
          New task
        </Button>
      </div>
    </header>
  );
}

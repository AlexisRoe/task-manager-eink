import { DateNav } from "@/components/date-nav.component";
import { useUiStore } from "@/store/ui.store";
import type { ViewName } from "@/types/view.types";
import { Button, Segmented, Title } from "@/ui";

const VIEWS: readonly { id: ViewName; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "history", label: "History" },
];

const isViewName = (value: string): value is ViewName => VIEWS.some((view) => view.id === value);

/** Brand, view switch, date navigation and the "New task" action. */
export function AppHeader() {
  const view = useUiStore((state) => state.view);
  const setView = useUiStore((state) => state.setView);
  const openModal = useUiStore((state) => state.openModal);

  return (
    <header className="app-header">
      <Title size="3">Daybook</Title>
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
      <div className="app-header__nav">{view === "history" ? null : <DateNav />}</div>
      <Button iconLeft="plus" onClick={() => openModal({ kind: "new-task" })}>
        New task
      </Button>
    </header>
  );
}

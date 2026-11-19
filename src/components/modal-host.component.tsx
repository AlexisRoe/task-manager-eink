import { DeleteRecurringModal } from "@/components/delete-recurring-modal.component";
import { NewTaskModal } from "@/components/new-task-modal.component";
import { useUiStore } from "@/store/ui.store";
import { todayIso } from "@/utils/date.utils";

/** Renders whichever modal the UI store currently asks for. */
export function ModalHost() {
  const modal = useUiStore((state) => state.modal);
  const view = useUiStore((state) => state.view);
  const date = useUiStore((state) => state.date);
  const close = useUiStore((state) => state.closeModal);

  switch (modal.kind) {
    case "new-task":
      return <NewTaskModal date={view === "history" ? todayIso() : date} onClose={close} />;
    case "delete-recurring":
      return <DeleteRecurringModal seriesId={modal.seriesId} date={modal.date} onClose={close} />;
    case "none":
      return null;
  }
}

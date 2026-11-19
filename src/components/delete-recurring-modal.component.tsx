import { useState } from "react";
import { useTasksStore } from "@/store/tasks.store";
import type { IsoDate } from "@/types/task.types";
import { Modal, RadioInput } from "@/ui";

/** Props of {@link DeleteRecurringModal}. */
export interface DeleteRecurringModalProps {
  seriesId: string;
  /** Date of the occurrence the user chose to delete. */
  date: IsoDate;
  onClose: () => void;
}

type Scope = "day" | "future";

/** Asks whether to delete only the chosen day of a recurring task or this and all future days. */
export function DeleteRecurringModal({ seriesId, date, onClose }: DeleteRecurringModalProps) {
  const skipOccurrence = useTasksStore((state) => state.skipOccurrence);
  const endSeriesFrom = useTasksStore((state) => state.endSeriesFrom);
  const [scope, setScope] = useState<Scope>("day");

  const confirm = () => {
    if (scope === "day") skipOccurrence(seriesId, date);
    else endSeriesFrom(seriesId, date);
    onClose();
  };

  return (
    <Modal open title="Delete recurring task" onClosed={onClose} onAccept={confirm}>
      <Modal.Close />
      <RadioInput.Group
        label="Which days should be deleted?"
        value={scope}
        onChange={(value) => setScope(value === "future" ? "future" : "day")}
      >
        <RadioInput value="day">Only this day</RadioInput>
        <RadioInput value="future">This and all future days</RadioInput>
      </RadioInput.Group>
      <Modal.CloseButton>Cancel</Modal.CloseButton>
      <Modal.ActionButton>Delete</Modal.ActionButton>
    </Modal>
  );
}

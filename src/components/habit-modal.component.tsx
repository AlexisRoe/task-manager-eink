import { useState } from "react";
import { HABITS_MAX_ACTIVE } from "@/constants/habit.constants";
import { TITLE_MAX_LENGTH } from "@/constants/task.constants";
import { useActiveHabitCount } from "@/hooks/habits.hook";
import { useTasksStore } from "@/store/tasks.store";
import type { Habit, IsoDate } from "@/types/task.types";
import { Input, Modal, Text } from "@/ui";
import { validateHabitTitle } from "@/utils/validate.utils";

/** Props of {@link HabitModal}. */
export interface HabitModalProps {
  /** Today's date; a new habit starts on it. */
  today: IsoDate;
  onClose: () => void;
  /** When set, the modal renames this habit instead of creating one. */
  editing?: Habit;
}

/**
 * Form modal for creating a daily habit or, with `editing`, changing its title. The title is
 * validated and length-limited; creation is refused once the maximum of active habits is reached.
 */
export function HabitModal({ today, onClose, editing }: HabitModalProps) {
  const addHabit = useTasksStore((state) => state.addHabit);
  const renameHabit = useTasksStore((state) => state.renameHabit);
  const activeCount = useActiveHabitCount();
  const [title, setTitle] = useState(editing?.title ?? "");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const result = validateHabitTitle(title);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (editing) renameHabit(editing.id, result.value);
    else if (!addHabit(result.value, today)) {
      setError(`You already have ${HABITS_MAX_ACTIVE} active habits`);
      return;
    }
    onClose();
  };

  return (
    <Modal open title={editing ? "Edit habit" : "New habit"} onClosed={onClose} onAccept={submit}>
      <Modal.Close />
      <div className="new-task">
        <Input
          value={title}
          onChange={setTitle}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="What do you want to do every day?"
          required
        >
          Title
        </Input>
        {error ? <Text role="alert">{error}</Text> : null}
        {editing ? (
          <Text>The new title applies to all days, including past ones.</Text>
        ) : (
          <Text>
            {activeCount} of {HABITS_MAX_ACTIVE} habits active
          </Text>
        )}
      </div>
      <Modal.CloseButton>Cancel</Modal.CloseButton>
      <Modal.ActionButton>{editing ? "Save" : "Add habit"}</Modal.ActionButton>
    </Modal>
  );
}

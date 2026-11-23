import { useTasksStore } from "@/store/tasks.store";
import type { Habit, IsoDate } from "@/types/task.types";
import { Modal, Text } from "@/ui";

/** Props of {@link DeleteHabitModal}. */
export interface DeleteHabitModalProps {
  habit: Habit;
  /** Today's date; the habit ends on it. */
  today: IsoDate;
  onClose: () => void;
}

/** Confirms deleting a habit; it stops as of today while past check-ins stay in History. */
export function DeleteHabitModal({ habit, today, onClose }: DeleteHabitModalProps) {
  const deleteHabit = useTasksStore((state) => state.deleteHabit);

  const confirm = () => {
    deleteHabit(habit.id, today);
    onClose();
  };

  return (
    <Modal open title="Delete habit" onClosed={onClose} onAccept={confirm}>
      <Modal.Close />
      <Text>
        Delete "{habit.title}"? It no longer appears from today on; past check-ins stay in History.
      </Text>
      <Modal.CloseButton>Cancel</Modal.CloseButton>
      <Modal.ActionButton>Delete</Modal.ActionButton>
    </Modal>
  );
}

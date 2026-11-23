import { habitRowKey } from "@/hooks/habits.hook";
import type { DayHabit } from "@/types/task.types";
import { Button, Checkbox, Title } from "@/ui";

/** Props of {@link HabitList}. */
export interface HabitListProps {
  habits: readonly DayHabit[];
  done: number;
  /** Whether habits can be checked off on the shown day (today or earlier). */
  checkable: boolean;
  openRow: string | null;
  onToggleRow: (key: string) => void;
  onToggleDone: (habit: DayHabit) => void;
  onEdit: (habit: DayHabit) => void;
  onDelete: (habit: DayHabit) => void;
}

/** Titled section of the day's habits with progress; rows expand to offer Edit and Delete. */
export function HabitList({
  habits,
  done,
  checkable,
  openRow,
  onToggleRow,
  onToggleDone,
  onEdit,
  onDelete,
}: HabitListProps) {
  return (
    <section className="task-list" aria-label="Habits">
      <div className="task-list__header">
        <Title size="3">Habits</Title>
        <Title size="3">
          {done}/{habits.length}
        </Title>
      </div>
      <ul className="task-list__items">
        {habits.map((habit) => {
          const key = habitRowKey(habit);
          const expanded = openRow === key;
          return (
            <li key={key} className="task-row" data-expanded={expanded} data-done={habit.done}>
              <div className="task-row__main">
                <Checkbox
                  checked={habit.done}
                  disabled={!checkable}
                  onChange={() => onToggleDone(habit)}
                  aria-label={`Mark habit "${habit.title}" as done`}
                >
                  {""}
                </Checkbox>
                <button
                  type="button"
                  className="task-row__body"
                  aria-expanded={expanded}
                  onClick={() => onToggleRow(key)}
                >
                  <span className="task-row__title">{habit.title}</span>
                </button>
              </div>
              {expanded ? (
                <div className="task-row__details">
                  <div className="task-row__actions">
                    <Button.Outlined onClick={() => onEdit(habit)}>Edit</Button.Outlined>
                    <Button.Outlined onClick={() => onDelete(habit)}>Delete</Button.Outlined>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

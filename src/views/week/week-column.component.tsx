import type { WeekDay } from "@/hooks/week.hook";
import type { DayTask } from "@/types/task.types";
import { Button, Checkbox, Inverted, Label, ProgressBar, Text } from "@/ui";
import { dayOfMonth, formatWeekdayShort } from "@/utils/date.utils";

/** Props of {@link WeekColumn}. */
export interface WeekColumnProps {
  day: WeekDay;
  isToday: boolean;
  isPast: boolean;
  onOpenDay: () => void;
  onToggle: (task: DayTask) => void;
}

/** One day of the week: heading that opens the day, progress, and checkable task items. */
export function WeekColumn({ day, isToday, isPast, onOpenDay, onToggle }: WeekColumnProps) {
  const percent = day.total === 0 ? 0 : (day.done / day.total) * 100;
  return (
    <Inverted active={isToday} className="week-column" data-past={isPast && !isToday}>
      <Button.Naked
        className="week-column__header"
        aria-label={`Open ${formatWeekdayShort(day.date)} ${dayOfMonth(day.date)}`}
        onClick={onOpenDay}
      >
        <span className="week-column__heading">
          <Label>{formatWeekdayShort(day.date).toUpperCase()}</Label>
          <span className="week-column__date">{dayOfMonth(day.date)}</span>
        </span>
      </Button.Naked>
      <div className="week-column__progress">
        <ProgressBar.Naked value={percent} aria-label={`${day.done} of ${day.total} done`} />
        <Text as="span">
          {day.done}/{day.total}
        </Text>
      </div>
      <ul className="week-column__items">
        {day.tasks.map((task) => (
          <li key={`${task.source}:${task.id}`} className="week-column__item" data-done={task.done}>
            <Checkbox
              checked={task.done}
              onChange={() => onToggle(task)}
              aria-label={`Mark "${task.title}" as done`}
            >
              <span className="week-column__item-text">
                <span className="week-column__item-time">{task.start ?? "Anytime"}</span>
                <span className="week-column__item-title">{task.title}</span>
              </span>
            </Checkbox>
          </li>
        ))}
      </ul>
    </Inverted>
  );
}

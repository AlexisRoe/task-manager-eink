import type { IsoDate } from "@/types/task.types";
import { Button, Checkbox, Inverted, Label, ProgressBar, Text } from "@/ui";
import { dayOfMonth, formatWeekdayShort } from "@/utils/date.utils";

/** A checkable entry of a week column, whether task or habit. */
export interface WeekItem {
  key: string;
  title: string;
  /** Start time or "Anytime"; omitted for entries without a time such as habits. */
  time?: string;
  done: boolean;
  disabled?: boolean;
  ariaLabel: string;
  onToggle: () => void;
}

/** Props of {@link WeekColumn}. */
export interface WeekColumnProps {
  day: { date: IsoDate; done: number; total: number };
  items: readonly WeekItem[];
  isToday: boolean;
  isPast: boolean;
  onOpenDay: () => void;
}

/** One day of the week: heading that opens the day, progress, and checkable items. */
export function WeekColumn({ day, items, isToday, isPast, onOpenDay }: WeekColumnProps) {
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
        {items.map((item) => (
          <li key={item.key} className="week-column__item" data-done={item.done}>
            <Checkbox
              checked={item.done}
              disabled={item.disabled === true}
              onChange={item.onToggle}
              aria-label={item.ariaLabel}
            >
              <span className="week-column__item-text">
                {item.time === undefined ? null : (
                  <span className="week-column__item-time">{item.time}</span>
                )}
                <span className="week-column__item-title">{item.title}</span>
              </span>
            </Checkbox>
          </li>
        ))}
      </ul>
    </Inverted>
  );
}

import "./week.view.css";
import { useNow } from "@/hooks/now.hook";
import { useTaskActions } from "@/hooks/task-actions.hook";
import { useWeekData } from "@/hooks/week.hook";
import { useUiStore } from "@/store/ui.store";
import { Text, Title } from "@/ui";
import { formatDate, isoWeekNumber, todayIso } from "@/utils/date.utils";
import { WeekColumn } from "./week-column.component";

/** The Week view: Monday to Sunday columns with progress and checkable tasks per day. */
export function WeekView() {
  const date = useUiStore((state) => state.date);
  const openDay = useUiStore((state) => state.openDay);
  const today = todayIso(useNow());
  const { days, done, total } = useWeekData(date);
  const { toggleDone } = useTaskActions();
  const first = days[0]?.date ?? date;
  const last = days[days.length - 1]?.date ?? date;
  const sameMonth = formatDate(first, { month: "long" }) === formatDate(last, { month: "long" });
  const range = sameMonth
    ? `${formatDate(first, { day: "numeric" })} – ${formatDate(last, { day: "numeric", month: "long", year: "numeric" })}`
    : `${formatDate(first, { day: "numeric", month: "long" })} – ${formatDate(last, { day: "numeric", month: "long", year: "numeric" })}`;

  return (
    <div className="week-view">
      <div className="week-view__heading">
        <Title size="1">Week {isoWeekNumber(date)}</Title>
        <Text as="span">{range}</Text>
        <Text as="span" className="week-view__progress">
          {done} of {total} done
        </Text>
      </div>
      <div className="week-view__columns">
        {days.map((day) => (
          <WeekColumn
            key={day.date}
            day={day}
            isToday={day.date === today}
            isPast={day.date < today}
            onOpenDay={() => openDay(day.date)}
            onToggle={toggleDone}
          />
        ))}
      </div>
    </div>
  );
}

import "./week.view.css";
import { useState } from "react";
import {
  DEFAULT_WEEK_PANE,
  isWeekPane,
  WEEK_PANES,
  type WeekPane,
} from "@/constants/week.constants";
import { useToggleHabit } from "@/hooks/habits.hook";
import { useNow } from "@/hooks/now.hook";
import { useIsPortrait } from "@/hooks/orientation.hook";
import { useTaskActions } from "@/hooks/task-actions.hook";
import { useWeekData, useWeekHabitData } from "@/hooks/week.hook";
import { useUiStore } from "@/store/ui.store";
import { Segmented, Text, Title } from "@/ui";
import { formatDate, isoWeekNumber, todayIso } from "@/utils/date.utils";
import { WeekColumn, type WeekItem } from "./week-column.component";

/** The Week view: Monday to Sunday columns with progress and checkable tasks per day. */
export function WeekView() {
  const date = useUiStore((state) => state.date);
  const openDay = useUiStore((state) => state.openDay);
  const today = todayIso(useNow());
  const taskData = useWeekData(date);
  const habitData = useWeekHabitData(date);
  const { toggleDone } = useTaskActions();
  const toggleHabit = useToggleHabit();
  const portrait = useIsPortrait();
  const [pane, setPane] = useState<WeekPane>(DEFAULT_WEEK_PANE);
  const showHabits = portrait && pane === "habits";
  const { days, done, total } = showHabits ? habitData : taskData;
  const first = days[0]?.date ?? date;
  const last = days[days.length - 1]?.date ?? date;
  const sameMonth = formatDate(first, { month: "long" }) === formatDate(last, { month: "long" });
  const range = sameMonth
    ? `${formatDate(first, { day: "numeric" })} – ${formatDate(last, { day: "numeric", month: "long", year: "numeric" })}`
    : `${formatDate(first, { day: "numeric", month: "long" })} – ${formatDate(last, { day: "numeric", month: "long", year: "numeric" })}`;

  const itemsOf = (index: number): WeekItem[] => {
    if (showHabits) {
      const day = habitData.days[index];
      return (day?.habits ?? []).map((habit) => ({
        key: `habit:${habit.id}`,
        title: habit.title,
        done: habit.done,
        disabled: habit.date > today,
        ariaLabel: `Mark habit "${habit.title}" as done`,
        onToggle: () => toggleHabit(habit),
      }));
    }
    return (taskData.days[index]?.tasks ?? []).map((task) => ({
      key: `${task.source}:${task.id}`,
      title: task.title,
      time: task.start ?? "Anytime",
      done: task.done,
      ariaLabel: `Mark "${task.title}" as done`,
      onToggle: () => toggleDone(task),
    }));
  };

  return (
    <div className="week-view">
      {portrait ? (
        <Segmented
          value={pane}
          onChange={(id) => {
            if (isWeekPane(id)) setPane(id);
          }}
          aria-label="Week content"
        >
          {WEEK_PANES.map(({ id, label }) => (
            <Segmented.Item key={id} id={id}>
              {label}
            </Segmented.Item>
          ))}
        </Segmented>
      ) : null}
      <div className="week-view__heading">
        <Title size="1">Week {isoWeekNumber(date)}</Title>
        <Text as="span">{range}</Text>
        <Text as="span" className="week-view__progress">
          {done} of {total} done
        </Text>
      </div>
      <div className="week-view__columns">
        {days.map((day, index) => (
          <WeekColumn
            key={day.date}
            day={day}
            items={itemsOf(index)}
            isToday={day.date === today}
            isPast={day.date < today}
            onOpenDay={() => openDay(day.date)}
          />
        ))}
      </div>
    </div>
  );
}

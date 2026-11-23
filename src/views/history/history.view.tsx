import "./history.view.css";
import { useMemo, useState } from "react";
import { HEATMAP_ROW_LABELS, HISTORY_WEEKS } from "@/constants/history.constants";
import { useDayData } from "@/hooks/day.hook";
import { useDayHabits, useToggleHabit } from "@/hooks/habits.hook";
import { useHistoryData } from "@/hooks/history.hook";
import { useNow } from "@/hooks/now.hook";
import { useIsPortrait } from "@/hooks/orientation.hook";
import { useTaskActions } from "@/hooks/task-actions.hook";
import { useUiStore } from "@/store/ui.store";
import type { IsoDate } from "@/types/task.types";
import { Button, Checkbox, Heatmap, type HeatmapCell, Text, Title, Toggle } from "@/ui";
import {
  addDays,
  formatDate,
  formatFullDate,
  formatMonthShort,
  formatWeekdayLong,
  todayIso,
} from "@/utils/date.utils";
import { type DayStats, heatmapLevel, type StatsByDate } from "@/utils/history.utils";

const NO_STATS: DayStats = { total: 0, done: 0 };

/** Builds heatmap columns (one per week) from per-date stats; `noun` names what was done in cell labels. */
function heatmapColumns(
  weekStarts: readonly IsoDate[],
  stats: StatsByDate,
  today: IsoDate,
  noun: string,
): HeatmapCell[][] {
  return weekStarts.map((monday) =>
    Array.from({ length: HEATMAP_ROW_LABELS.length }, (_, offset) => {
      const date = addDays(monday, offset);
      const day = stats.get(date) ?? NO_STATS;
      return {
        id: date,
        level: heatmapLevel(day),
        hidden: date > today,
        label: `${formatWeekdayLong(date)} ${formatFullDate(date)}: ${day.done} of ${day.total} ${noun}done`,
      };
    }),
  );
}

/** The History view: task and habit completion heatmaps and the list of the selected day. */
export function HistoryView() {
  const today = todayIso(useNow());
  const openDay = useUiStore((state) => state.openDay);
  const [selected, setSelected] = useState(today);
  const { weekStarts, stats, habitStats } = useHistoryData(today);
  const { tasks, done, total } = useDayData(selected);
  const dayHabits = useDayHabits(selected);
  const { toggleDone } = useTaskActions();
  const toggleHabit = useToggleHabit();
  const portrait = useIsPortrait();
  const [heatmapsOnly, setHeatmapsOnly] = useState(true);
  const showOverview = !portrait || heatmapsOnly;
  const showDay = !portrait || !heatmapsOnly;

  const selectDay = (date: string) => {
    setSelected(date);
    setHeatmapsOnly(false);
  };

  const columns = useMemo(
    () => heatmapColumns(weekStarts, stats, today, ""),
    [weekStarts, stats, today],
  );
  const habitColumns = useMemo(
    () => heatmapColumns(weekStarts, habitStats, today, "habits "),
    [weekStarts, habitStats, today],
  );

  const columnLabels = useMemo(
    () =>
      weekStarts.map((monday, index) => {
        const month = formatMonthShort(monday);
        const previous = weekStarts[index - 1];
        return previous !== undefined && formatMonthShort(previous) === month ? null : month;
      }),
    [weekStarts],
  );

  const first = weekStarts[0] ?? today;
  const range = `${formatDate(first, { month: "long" })} – ${formatDate(today, { month: "long", year: "numeric" })}`;

  const heading = (
    <div className="history-view__heading">
      <Title size="1">History</Title>
      <Text as="span">{range}</Text>
      {portrait ? (
        <div className="history-view__toggle">
          <Toggle checked={heatmapsOnly} onChange={setHeatmapsOnly}>
            Heatmaps
          </Toggle>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="history-view">
      {heading}
      {showOverview ? (
        <div className="history-view__main">
          <section className="history-view__heatmap" aria-label="Tasks">
            <Title size="2">Tasks</Title>
            <Heatmap
              columns={columns}
              columnLabels={columnLabels}
              rowLabels={HEATMAP_ROW_LABELS}
              selectedId={selected}
              onSelect={portrait ? selectDay : setSelected}
              legend={{ less: "Less", more: "All done" }}
              aria-label={`Task completion of the last ${HISTORY_WEEKS} weeks`}
            />
          </section>
          <section className="history-view__heatmap" aria-label="Habits">
            <Title size="2">Habits</Title>
            <Heatmap
              columns={habitColumns}
              columnLabels={columnLabels}
              rowLabels={HEATMAP_ROW_LABELS}
              selectedId={selected}
              onSelect={portrait ? selectDay : setSelected}
              legend={{ less: "Less", more: "All habits" }}
              aria-label={`Habit completion of the last ${HISTORY_WEEKS} weeks`}
            />
          </section>
        </div>
      ) : null}
      {showDay ? (
        <aside className="history-view__selected" aria-label="Selected day">
          <Title size="2">Selected day</Title>
          <Title size="3">{formatWeekdayLong(selected)}</Title>
          <Text>{formatFullDate(selected)}</Text>
          <Title size="4" className="history-view__subheading">
            {done} of {total} completed
          </Title>
          <ul className="history-view__tasks">
            {tasks.map((task) => (
              <li
                key={`${task.source}:${task.id}`}
                className="history-view__task"
                data-done={task.done}
              >
                <Checkbox
                  checked={task.done}
                  onChange={() => toggleDone(task)}
                  aria-label={`Mark "${task.title}" as done`}
                >
                  {task.title}
                </Checkbox>
                <span className="history-view__task-time">{task.start ?? "Anytime"}</span>
              </li>
            ))}
          </ul>
          {dayHabits.total > 0 ? (
            <>
              <Title size="4" className="history-view__subheading">
                {dayHabits.done} of {dayHabits.total} habits
              </Title>
              <ul
                className="history-view__tasks history-view__tasks--habits"
                aria-label="Habits of the selected day"
              >
                {dayHabits.habits.map((habit) => (
                  <li key={habit.id} className="history-view__task" data-done={habit.done}>
                    <Checkbox
                      checked={habit.done}
                      disabled={selected > today}
                      onChange={() => toggleHabit(habit)}
                      aria-label={`Mark habit "${habit.title}" as done`}
                    >
                      {habit.title}
                    </Checkbox>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <Button.Outlined fullWidth onClick={() => openDay(selected)}>
            Open this day
          </Button.Outlined>
        </aside>
      ) : null}
    </div>
  );
}

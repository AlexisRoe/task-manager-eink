import "./history.view.css";
import { useMemo, useState } from "react";
import {
  HEATMAP_ROW_LABELS,
  HISTORY_WEEKS,
  RECENT_DAYS,
  STREAK_MIN_RATIO,
} from "@/constants/history.constants";
import { useDayData } from "@/hooks/day.hook";
import { useHistoryData } from "@/hooks/history.hook";
import { useNow } from "@/hooks/now.hook";
import { useTaskActions } from "@/hooks/task-actions.hook";
import { useUiStore } from "@/store/ui.store";
import { Button, Checkbox, Heatmap, type HeatmapCell, Label, Text, Title, Value } from "@/ui";
import {
  addDays,
  formatDate,
  formatFullDate,
  formatMonthShort,
  formatWeekdayLong,
  todayIso,
} from "@/utils/date.utils";
import { heatmapLevel } from "@/utils/history.utils";

/** The History view: completion heatmap, headline statistics and the list of the selected day. */
export function HistoryView() {
  const today = todayIso(useNow());
  const openDay = useUiStore((state) => state.openDay);
  const [selected, setSelected] = useState(today);
  const { weekStarts, stats, streak, doneRecently, averageRatio } = useHistoryData(today);
  const { tasks, done, total } = useDayData(selected);
  const { toggleDone } = useTaskActions();

  const columns = useMemo<HeatmapCell[][]>(
    () =>
      weekStarts.map((monday) =>
        Array.from({ length: HEATMAP_ROW_LABELS.length }, (_, offset) => {
          const date = addDays(monday, offset);
          const day = stats.get(date) ?? { total: 0, done: 0 };
          return {
            id: date,
            level: heatmapLevel(day),
            hidden: date > today,
            label: `${formatWeekdayLong(date)} ${formatFullDate(date)}: ${day.done} of ${day.total} done`,
          };
        }),
      ),
    [weekStarts, stats, today],
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

  return (
    <div className="history-view">
      <div className="history-view__main">
        <div className="history-view__heading">
          <Title size="1">History</Title>
          <Text as="span">{range}</Text>
        </div>
        <Heatmap
          columns={columns}
          columnLabels={columnLabels}
          rowLabels={HEATMAP_ROW_LABELS}
          selectedId={selected}
          onSelect={setSelected}
          legend={{ less: "Less", more: "All done" }}
          aria-label={`Task completion of the last ${HISTORY_WEEKS} weeks`}
        />
        <div className="history-view__stats">
          <div>
            <Value unit="days" size="xl">
              {streak}
            </Value>
            <Text>Current streak, {Math.round(STREAK_MIN_RATIO * 100)}% or more done</Text>
          </div>
          <div>
            <Value unit="" size="xl">
              {doneRecently}
            </Value>
            <Text>Tasks done in the last {RECENT_DAYS} days</Text>
          </div>
          <div>
            <Value unit="%" size="xl">
              {Math.round(averageRatio * 100)}
            </Value>
            <Text>Average completion, {HISTORY_WEEKS} weeks</Text>
          </div>
        </div>
      </div>
      <aside className="history-view__selected" aria-label="Selected day">
        <Label>SELECTED DAY</Label>
        <Title size="2">{formatWeekdayLong(selected)}</Title>
        <Text>{formatFullDate(selected)}</Text>
        <Title size="4">
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
        <Button.Outlined fullWidth onClick={() => openDay(selected)}>
          Open this day
        </Button.Outlined>
      </aside>
    </div>
  );
}

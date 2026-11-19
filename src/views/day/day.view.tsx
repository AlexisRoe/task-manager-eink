import "./day.view.css";
import { useMemo } from "react";
import {
  CARRY_PROMPT_ENABLED,
  DAY_END_HOUR,
  DAY_START_HOUR,
  HOUR_HEIGHT_PX,
  MIN_BLOCK_HEIGHT_PX,
} from "@/config/app.config";
import { useDayData } from "@/hooks/day.hook";
import { useNow } from "@/hooks/now.hook";
import { rowKey, useTaskActions } from "@/hooks/task-actions.hook";
import { timelineScroll } from "@/hooks/timeline-scroll.hook";
import { selectCarryOverCandidates, selectShowCarryOver } from "@/store/tasks.selectors";
import { useTasksStore } from "@/store/tasks.store";
import { useUiStore } from "@/store/ui.store";
import { Pill, Text, TimeGrid, type TimeGridItem, Title } from "@/ui";
import { formatFullDate, formatWeekdayLong, todayIso } from "@/utils/date.utils";
import { minutesOfDay, toMinutes } from "@/utils/time.utils";
import { CarryOverBanner } from "./carry-over-banner.component";
import { TaskList } from "./task-list.component";

/** The Day view: header with progress, hour timeline and the scheduled / anytime task lists. */
export function DayView() {
  const date = useUiStore((state) => state.date);
  const openRow = useUiStore((state) => state.openRow);
  const toggleRow = useUiStore((state) => state.toggleRow);
  const now = useNow();
  const today = todayIso(now);
  const { scheduled, anytime, done, total } = useDayData(date);
  const actions = useTaskActions();

  const tasks = useTasksStore((state) => state.tasks);
  const carryDismissedOn = useTasksStore((state) => state.carryDismissedOn);
  const carryOverToToday = useTasksStore((state) => state.carryOverToToday);
  const dismissCarryOver = useTasksStore((state) => state.dismissCarryOver);
  const carryData = useMemo(
    () => ({ tasks, series: [], occurrences: {}, carryDismissedOn }),
    [tasks, carryDismissedOn],
  );
  const showCarry = date === today && selectShowCarryOver(carryData, today, CARRY_PROMPT_ENABLED);
  const carryCount = showCarry ? selectCarryOverCandidates(carryData, today).length : 0;

  const items = useMemo<TimeGridItem[]>(
    () =>
      scheduled.map((task) => ({
        id: rowKey(task),
        startMin: toMinutes(task.start ?? "00:00"),
        durationMin: task.durationMin,
        label: task.title,
        done: task.done,
        emphasis: task.priority === 1,
        content: (
          <>
            <span className="day-view__block-time">{task.start}</span> {task.title}
          </>
        ),
        onSelect: () => toggleRow(rowKey(task)),
      })),
    [scheduled, toggleRow],
  );

  const scroll = timelineScroll(date, today, minutesOfDay(now));

  return (
    <div className="day-view">
      <div className="day-view__heading">
        <Title size="1">{formatWeekdayLong(date)}</Title>
        <Text as="span">{formatFullDate(date)}</Text>
        {date === today ? <Pill size="sm">Today</Pill> : null}
        <Text as="span" className="day-view__progress">
          {done} of {total} done
        </Text>
      </div>
      <div className="day-view__columns">
        <TimeGrid
          className="day-view__timeline"
          startHour={DAY_START_HOUR}
          endHour={DAY_END_HOUR}
          hourHeight={HOUR_HEIGHT_PX}
          minBlockHeight={MIN_BLOCK_HEIGHT_PX}
          items={items}
          scrollToMinutes={scroll.scrollToMinutes}
          scrollKey={scroll.scrollKey}
          {...(date === today ? { nowMinutes: minutesOfDay(now) } : {})}
        />
        <div className="day-view__lists">
          {showCarry ? (
            <CarryOverBanner
              count={carryCount}
              onMove={() => carryOverToToday(today)}
              onLeave={() => dismissCarryOver(today)}
            />
          ) : null}
          <TaskList
            title="Scheduled"
            tasks={scheduled}
            openRow={openRow}
            onToggleRow={toggleRow}
            actions={actions}
          />
          <TaskList
            title="Anytime"
            tasks={anytime}
            openRow={openRow}
            onToggleRow={toggleRow}
            actions={actions}
          />
        </div>
      </div>
    </div>
  );
}

import "./day.view.css";
import { useMemo, useState } from "react";
import {
  CARRY_PROMPT_ENABLED,
  DAY_END_HOUR,
  DAY_START_HOUR,
  HOUR_HEIGHT_PX,
  MIN_BLOCK_HEIGHT_PX,
} from "@/config/app.config";
import { DAY_PANES, type DayPane, DEFAULT_DAY_PANE, isDayPane } from "@/constants/day.constants";
import { useDayData } from "@/hooks/day.hook";
import { useDayHabits, useToggleHabit } from "@/hooks/habits.hook";
import { useNow } from "@/hooks/now.hook";
import { useIsPortrait } from "@/hooks/orientation.hook";
import { rowKey, useTaskActions } from "@/hooks/task-actions.hook";
import { timelineScroll } from "@/hooks/timeline-scroll.hook";
import { selectCarryOverCandidates, selectShowCarryOver } from "@/store/tasks.selectors";
import { useTasksStore } from "@/store/tasks.store";
import { useUiStore } from "@/store/ui.store";
import { Pill, Segmented, Text, TimeGrid, type TimeGridItem, Title } from "@/ui";
import { formatFullDate, formatWeekdayLong, todayIso } from "@/utils/date.utils";
import { minutesOfDay, toMinutes } from "@/utils/time.utils";
import { CarryOverBanner } from "./carry-over-banner.component";
import { HabitList } from "./habit-list.component";
import { TaskList } from "./task-list.component";

/** The Day view: header with task progress, hour timeline, the day's habits and the scheduled / anytime task lists. */
export function DayView() {
  const date = useUiStore((state) => state.date);
  const openRow = useUiStore((state) => state.openRow);
  const toggleRow = useUiStore((state) => state.toggleRow);
  const now = useNow();
  const today = todayIso(now);
  const { scheduled, anytime, done, total } = useDayData(date);
  const actions = useTaskActions();
  const dayHabits = useDayHabits(date);
  const toggleHabit = useToggleHabit();
  const openModal = useUiStore((state) => state.openModal);
  const portrait = useIsPortrait();
  const [pane, setPane] = useState<DayPane>(DEFAULT_DAY_PANE);
  const showTimeline = !portrait || pane === "timeline";
  const showLists = !portrait || pane === "list";

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
      {portrait ? (
        <Segmented
          className="day-view__panes"
          value={pane}
          onChange={(id) => {
            if (isDayPane(id)) setPane(id);
          }}
          aria-label="Day layout"
        >
          {DAY_PANES.map(({ id, label }) => (
            <Segmented.Item key={id} id={id}>
              {label}
            </Segmented.Item>
          ))}
        </Segmented>
      ) : null}
      <div className="day-view__columns" data-portrait={portrait}>
        {showTimeline ? (
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
        ) : null}
        {showLists ? (
          <div className="day-view__lists">
            {showCarry ? (
              <CarryOverBanner
                count={carryCount}
                onMove={() => carryOverToToday(today)}
                onLeave={() => dismissCarryOver(today)}
              />
            ) : null}
            {dayHabits.total > 0 ? (
              <HabitList
                habits={dayHabits.habits}
                done={dayHabits.done}
                checkable={date <= today}
                openRow={openRow}
                onToggleRow={toggleRow}
                onToggleDone={toggleHabit}
                onEdit={(habit) => openModal({ kind: "edit-habit", id: habit.id })}
                onDelete={(habit) => openModal({ kind: "delete-habit", id: habit.id })}
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
        ) : null}
      </div>
    </div>
  );
}

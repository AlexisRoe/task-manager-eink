import "./stats.view.css";
import { useState } from "react";
import { STATS_WEEKS, STATS_WINDOW_DAYS } from "@/config/stats.config";
import { PRIORITY_LABELS, WEEKDAY_LABELS } from "@/constants/stats.constants";
import { PROJECTS } from "@/constants/task.constants";
import { useNow } from "@/hooks/now.hook";
import { useIsPortrait } from "@/hooks/orientation.hook";
import { useStatsData } from "@/hooks/stats.hook";
import {
  BarChart,
  ColumnChart,
  Label,
  Pill,
  ProgressBar,
  Table,
  Text,
  Title,
  Toggle,
  Trend,
  Value,
} from "@/ui";
import { formatDate, todayIso } from "@/utils/date.utils";
import { percent } from "@/utils/stats.utils";

/** The Stats view: headline numbers, habit streaks and task completion charts. */
export function StatsView() {
  const today = todayIso(useNow());
  const stats = useStatsData(today);
  const portrait = useIsPortrait();
  const [habitsOnly, setHabitsOnly] = useState(true);
  const showHabits = !portrait || habitsOnly;
  const showTasks = !portrait || !habitsOnly;

  const [previous, latest] = stats.weekly.slice(-2);
  const trend =
    previous === undefined || latest === undefined || previous.total === 0
      ? "none"
      : percent(latest) > percent(previous)
        ? "up"
        : percent(latest) < percent(previous)
          ? "down"
          : "none";

  const weekLabels = stats.weekStarts.map((monday) =>
    formatDate(monday, { day: "numeric", month: "short" }),
  );

  return (
    <div className="stats-view">
      <div className="stats-view__heading">
        <Title size="1">Stats</Title>
        <Text as="span">Last {STATS_WINDOW_DAYS} days</Text>
        {portrait ? (
          <div className="stats-view__toggle">
            <Toggle checked={habitsOnly} onChange={setHabitsOnly}>
              Habits
            </Toggle>
          </div>
        ) : null}
      </div>
      <section className="stats-view__headline" aria-label="Overview">
        <div>
          <Label>COMPLETION</Label>
          <Value unit="%" size="xl">
            {stats.rate}
          </Value>
        </div>
        <div>
          <Label>DONE THIS WEEK</Label>
          <Value unit="tasks" size="xl">
            {stats.doneThisWeek}
          </Value>
        </div>
        <div>
          <Label>BEST STREAK</Label>
          <Value unit="days" size="xl">
            {stats.bestStreak}
          </Value>
        </div>
      </section>
      {showHabits ? (
        <section className="stats-view__habits" aria-label="Habit streaks">
          <Label>HABIT STREAKS</Label>
          {stats.habits.length === 0 ? (
            <Text>No habits yet.</Text>
          ) : (
            <Table>
              <Table.Head>
                <Table.HeaderCell>Habit</Table.HeaderCell>
                <Table.HeaderCell>Now</Table.HeaderCell>
                <Table.HeaderCell>Best</Table.HeaderCell>
                <Table.HeaderCell>{STATS_WINDOW_DAYS} days</Table.HeaderCell>
              </Table.Head>
              <Table.Body>
                {stats.habits.map((habit) => (
                  <Table.Row key={habit.id} selectable={false}>
                    <Table.Cell>
                      {habit.title}{" "}
                      {habit.flag === null ? null : (
                        <Pill size="sm">{habit.flag === "always" ? "Always" : "Never"}</Pill>
                      )}
                    </Table.Cell>
                    <Table.Cell>{habit.current}</Table.Cell>
                    <Table.Cell>{habit.longest}</Table.Cell>
                    <Table.Cell>
                      <ProgressBar value={habit.rate} label={`${habit.rate}%`} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </section>
      ) : null}
      {showTasks ? (
        <div className="stats-view__charts">
          <section aria-label="Weekly trend">
            <div className="stats-view__chart-title">
              <Label>{`TASKS PER WEEK · LAST ${STATS_WEEKS} WEEKS`}</Label>
              <Trend direction={trend} size="sm">
                vs. last week
              </Trend>
            </div>
            <ColumnChart
              datasets={[
                { label: "Planned", data: stats.weekly.map((w) => w.total) },
                { label: "Done", data: stats.weekly.map((w) => w.done) },
              ]}
              categories={weekLabels}
              withLegend
              aria-label="Planned and done tasks per week"
            />
          </section>
          <section aria-label="Weekday pattern">
            <Label>COMPLETION BY WEEKDAY</Label>
            <ColumnChart
              datasets={[{ label: "Done %", data: stats.weekday }]}
              categories={[...WEEKDAY_LABELS]}
              withLabel
            />
          </section>
          <section aria-label="By project">
            <Label>COMPLETION BY PROJECT</Label>
            <BarChart
              datasets={[{ label: "Done %", data: stats.byProject }]}
              categories={[...PROJECTS]}
              withLabel
            />
          </section>
          <section aria-label="By priority">
            <Label>COMPLETION BY PRIORITY</Label>
            <BarChart
              datasets={[{ label: "Done %", data: stats.byPriority }]}
              categories={[...PRIORITY_LABELS]}
              withLabel
            />
          </section>
        </div>
      ) : null}
    </div>
  );
}

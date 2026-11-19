import { useUiStore } from "@/store/ui.store";
import { Button, Text } from "@/ui";
import { formatNavDate, isoWeekNumber, todayIso } from "@/utils/date.utils";

/** Previous / label / next / Today controls that move the shown day or week. */
export function DateNav() {
  const view = useUiStore((state) => state.view);
  const date = useUiStore((state) => state.date);
  const step = useUiStore((state) => state.step);
  const goToday = useUiStore((state) => state.goToday);
  const unit = view === "week" ? "week" : "day";
  const label = view === "week" ? `Week ${isoWeekNumber(date)}` : formatNavDate(date);

  return (
    <nav className="date-nav" aria-label="Date navigation">
      <Button.IconOutlined
        icon="chevron-left"
        aria-label={`Previous ${unit}`}
        onClick={() => step(-1)}
      />
      <Text as="span" className="date-nav__label">
        {label}
      </Text>
      <Button.IconOutlined
        icon="chevron-right"
        aria-label={`Next ${unit}`}
        onClick={() => step(1)}
      />
      <Button.Outlined onClick={() => goToday(todayIso())}>Today</Button.Outlined>
    </nav>
  );
}

import { Alert, Button } from "@/ui";

/** Props of {@link CarryOverBanner}. */
export interface CarryOverBannerProps {
  count: number;
  onMove: () => void;
  onLeave: () => void;
}

/** Offers to move yesterday's unfinished tasks to today or leave them where they are. */
export function CarryOverBanner({ count, onMove, onLeave }: CarryOverBannerProps) {
  return (
    <div className="carry-over">
      <Alert
        variant="info"
        icon="info-circle"
        title={`${count} unfinished ${count === 1 ? "task" : "tasks"} from yesterday`}
      />
      <div className="carry-over__actions">
        <Button onClick={onMove}>Move to today</Button>
        <Button.Outlined onClick={onLeave}>Leave</Button.Outlined>
      </div>
    </div>
  );
}

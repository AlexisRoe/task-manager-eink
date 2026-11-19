import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { cx } from "../utils/cx.utils";
import "./segmented.component.css";

interface SegmentedContextValue {
  value: string | null;
  select: (itemId: string) => void;
}

const SegmentedContext = createContext<SegmentedContextValue | null>(null);

/** Props accepted by {@link Segmented}. */
export interface SegmentedProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** Controlled selection: `id` of the highlighted item. When set, the parent owns the state. */
  value?: string;
  /** `id` of the item highlighted initially when uncontrolled. */
  defaultId?: string;
  /** Stretches the control to 100% width. Defaults to `false`. */
  fullWidth?: boolean;
  /** Called with the `id` of the clicked item. */
  onChange?: (id: string) => void;
}

/** Props accepted by {@link Segmented.Item}. */
export interface SegmentedItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "id"> {
  /** Identifies this item; passed to `onChange` and matched against `value`. */
  id: string;
  /** Item label. */
  children: ReactNode;
}

/** Single option of a {@link Segmented} control. */
function SegmentedItem({ className, id, children, ...rest }: SegmentedItemProps) {
  const context = useContext(SegmentedContext);
  const isSelected = context?.value === id;

  return (
    <li className="eink-segmented__item-wrapper">
      <button
        type="button"
        className={cx(
          "eink-segmented__item",
          [className ?? "", !!className],
          ["eink-segmented__item--selected", isSelected],
        )}
        aria-pressed={isSelected}
        onClick={() => context?.select(id)}
        {...rest}
      >
        {children}
      </button>
    </li>
  );
}

/**
 * Row of mutually exclusive items that can be driven from the outside through `value`, so the
 * highlighted item follows navigation triggered elsewhere in the app.
 *
 * @example
 * ```tsx
 * <Segmented value={view} onChange={setView}>
 *   <Segmented.Item id="day">Day</Segmented.Item>
 *   <Segmented.Item id="week">Week</Segmented.Item>
 * </Segmented>
 * ```
 */
export function Segmented({
  className,
  children,
  value,
  defaultId,
  fullWidth = false,
  onChange,
  ...rest
}: SegmentedProps) {
  const [internal, setInternal] = useState<string | null>(defaultId ?? null);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const select = (itemId: string) => {
    if (!controlled) setInternal(itemId);
    onChange?.(itemId);
  };

  return (
    <SegmentedContext.Provider value={{ value: current, select }}>
      <nav
        className={cx(
          "eink-segmented",
          [className ?? "", !!className],
          ["eink-segmented--full-width", fullWidth],
        )}
        {...rest}
      >
        <ul className="eink-segmented__list">{children}</ul>
      </nav>
    </SegmentedContext.Provider>
  );
}

Segmented.Item = SegmentedItem;

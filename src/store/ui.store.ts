import { create } from "zustand";
import { DAYS_PER_WEEK } from "@/constants/date.constants";
import type { IsoDate } from "@/types/task.types";
import type { ModalState, ViewName } from "@/types/view.types";
import { addDays, todayIso } from "@/utils/date.utils";

/** Transient UI state: which view and date are shown, which row is expanded, which modal is open. */
export interface UiState {
  view: ViewName;
  date: IsoDate;
  /** Key of the expanded task row, or `null`. */
  openRow: string | null;
  modal: ModalState;
  /** Switches the view and collapses any open row. */
  setView: (view: ViewName) => void;
  /** Jumps to a specific date. */
  setDate: (date: IsoDate) => void;
  /** Moves one step back (`-1`) or forward (`1`): a day in the Day view, a week in the Week view. */
  step: (direction: -1 | 1) => void;
  /** Resets the date to today. */
  goToday: (today: IsoDate) => void;
  /** Shows the given date in the Day view. */
  openDay: (date: IsoDate) => void;
  /** Expands the row with the given key, or collapses it if it is already open. */
  toggleRow: (key: string) => void;
  /** Opens a modal. */
  openModal: (modal: Exclude<ModalState, { kind: "none" }>) => void;
  /** Closes the current modal. */
  closeModal: () => void;
}

const initialState = () => ({
  view: "day" as ViewName,
  date: todayIso(),
  openRow: null as string | null,
  modal: { kind: "none" } as ModalState,
});

/** Store holding transient UI state; intentionally not persisted. */
export const useUiStore = create<UiState>()((set) => ({
  ...initialState(),
  setView: (view) => set({ view, openRow: null }),
  setDate: (date) => set({ date, openRow: null }),
  step: (direction) =>
    set((state) => ({
      date: addDays(state.date, state.view === "week" ? direction * DAYS_PER_WEEK : direction),
      openRow: null,
    })),
  goToday: (today) => set({ date: today, openRow: null }),
  openDay: (date) => set({ view: "day", date, openRow: null }),
  toggleRow: (key) => set((state) => ({ openRow: state.openRow === key ? null : key })),
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: { kind: "none" } }),
}));

/** Restores the UI store to its initial state; intended for tests. */
export function resetUiStore(): void {
  useUiStore.setState(initialState());
}

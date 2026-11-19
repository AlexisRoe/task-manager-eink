import { useEffect, useState } from "react";
import { useTasksStore } from "@/store/tasks.store";

/** Tells whether persisted tasks have finished loading from IndexedDB. */
export function useTasksHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useTasksStore.persist.hasHydrated());
  useEffect(() => {
    if (useTasksStore.persist.hasHydrated()) setHydrated(true);
    return useTasksStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}

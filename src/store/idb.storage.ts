import { createStore, del, get, set } from "idb-keyval";
import type { StateStorage } from "zustand/middleware";
import { IDB_DB_NAME, IDB_STORE_NAME } from "@/config/storage.config";

/**
 * Creates a zustand-compatible storage backed by IndexedDB so planner data survives reloads
 * and stays on the device.
 */
export function createIdbStorage(
  dbName: string = IDB_DB_NAME,
  storeName: string = IDB_STORE_NAME,
): StateStorage {
  const store = createStore(dbName, storeName);
  return {
    getItem: async (key) => (await get<string>(key, store)) ?? null,
    setItem: async (key, value) => {
      await set(key, value, store);
    },
    removeItem: async (key) => {
      await del(key, store);
    },
  };
}

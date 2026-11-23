import { SCHEMA_VERSION } from "@/config/storage.config";
import type { PersistedTasks } from "@/types/task.types";
import { isPersistedTasks } from "@/utils/validate.utils";

/** Creates an empty persisted state at the current schema version. */
export function emptyPersistedTasks(): PersistedTasks {
  return {
    version: SCHEMA_VERSION,
    tasks: [],
    series: [],
    occurrences: {},
    carryDismissedOn: null,
    habits: [],
    habitChecks: {},
  };
}

type Migration = (state: unknown) => unknown;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Migrations keyed by the version they upgrade from; each returns the next version's shape. */
const MIGRATIONS: Readonly<Record<number, Migration>> = {
  1: (state) => (isObject(state) ? { ...state, habits: [], habitChecks: {} } : state),
};

/**
 * Upgrades persisted data from any older version to the current schema and validates the result.
 * Returns `null` when the data is unusable so the caller can reset instead of crashing.
 */
export function migratePersistedTasks(raw: unknown, fromVersion: number): PersistedTasks | null {
  if (!Number.isInteger(fromVersion) || fromVersion < 1 || fromVersion > SCHEMA_VERSION)
    return null;
  let state = raw;
  for (let version = fromVersion; version < SCHEMA_VERSION; version += 1) {
    const migrate = MIGRATIONS[version];
    if (!migrate) return null;
    state = migrate(state);
  }
  if (!isPersistedTasks(state)) return null;
  return { ...state, version: SCHEMA_VERSION };
}

/** Name of the IndexedDB database holding all app data. */
export const IDB_DB_NAME = "daybook";

/** Name of the object store inside the database. */
export const IDB_STORE_NAME = "state";

/** Key under which the persisted task state is stored. */
export const PERSIST_KEY = "daybook-tasks";

/** Current persisted schema version; bump together with a migration. */
export const SCHEMA_VERSION = 1;

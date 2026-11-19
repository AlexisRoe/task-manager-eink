/** Creates a collision-resistant identifier for tasks and series. */
export function createId(): string {
  return crypto.randomUUID();
}

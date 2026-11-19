/**
 * Joins an optional base class name with conditional class names, mirroring the helper of
 * `e-ink-ui-lib` so candidates can be moved into the library unchanged.
 */
export function cx(
  base: string | undefined,
  ...conditions: Array<[className: string, condition: boolean]>
): string {
  return [base, ...conditions.map(([className, condition]) => (condition ? className : null))]
    .filter(Boolean)
    .join(" ");
}

/** A weather year's color in the multi-period chart — its legend and table rows use it too. */
export function periodColor(i: number, colors: readonly string[] | undefined): string {
  return colors?.[i] ?? `var(--color-period-${i})`;
}

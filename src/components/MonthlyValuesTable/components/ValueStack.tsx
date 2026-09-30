import { MONTHLY_VALUES_CLASSES as C } from "../MonthlyValuesTable.constant";
import type { TValueStackProps } from "../MonthlyValuesTable.type";

/**
 * A cell's value(s): one series' value, or A's above B's in their series colors — each named
 * for screen readers.
 */
export function ValueStack({ entries, className }: TValueStackProps) {
  if (entries.length === 1 && entries[0]) return <>{entries[0].text}</>;
  return (
    <span className={className}>
      {entries.map((entry) => (
        <span key={entry.srText} style={{ color: entry.color }}>
          <span aria-hidden>{entry.text}</span>
          <span className={C.SR_ONLY}>{entry.srText}</span>
        </span>
      ))}
    </span>
  );
}

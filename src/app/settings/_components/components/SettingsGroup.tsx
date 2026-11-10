import { SETTINGS_CLASSES as C } from "../Settings.constant";
import type { TSettingsGroupProps } from "../Settings.type";

/** One section of the settings card: a heading, then its rows. */
export function SettingsGroup({ id, title, children }: TSettingsGroupProps) {
  return (
    <section aria-labelledby={id} className={C.SECTION}>
      <h2 id={id} className={C.HEADING}>
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

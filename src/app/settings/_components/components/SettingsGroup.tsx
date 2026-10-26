import { SETTINGS_CLASSES as C } from "../Settings.constant";
import type { TSettingsGroupProps } from "../Settings.type";

/** One group of settings in the page's card: a heading, then its rows. */
export function SettingsGroup({ id, title, children }: TSettingsGroupProps) {
  return (
    <section aria-labelledby={id} className={C.GROUP}>
      <h2 id={id} className={C.HEADING}>
        {title}
      </h2>
      <div className={C.ROWS}>{children}</div>
    </section>
  );
}

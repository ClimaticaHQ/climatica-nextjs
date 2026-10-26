import { SETTINGS_CLASSES as C } from "../Settings.constant";
import type { TSettingsDependentRowsProps } from "../Settings.type";

/** A setting and the sub-settings that depend on it, nested under it in one row of the group. */
export function SettingsDependentRows({ parent, children }: TSettingsDependentRowsProps) {
  return (
    <div className={C.DEPENDENT}>
      {parent}
      <div className={C.DEPENDENT_CHILDREN}>{children}</div>
    </div>
  );
}

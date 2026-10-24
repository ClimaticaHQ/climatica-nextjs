import { SETTINGS_CLASSES as C } from "../Settings.constant";
import type { TSettingsRowProps } from "../Settings.type";

/**
 * A setting that isn't a switch: its label and description on the left, its control on the right
 * — a wide one under them on a phone.
 */
export function SettingsRow({
  labelId,
  label,
  description,
  isDisabled = false,
  disabledHint,
  hasWideControl = false,
  children,
}: TSettingsRowProps) {
  const isHintShown = isDisabled && disabledHint !== undefined;

  return (
    <div className={hasWideControl ? C.ROW_WIDE : C.ROW}>
      <div className={C.TEXT}>
        <span id={labelId} className={`${C.LABEL} ${isDisabled ? C.DISABLED_LABEL : ""}`}>
          {label}
        </span>
        <span className={`${C.DESCRIPTION} ${C.TEXT_STACK}`}>
          {description !== undefined && (
            <span aria-hidden={isHintShown} className={isHintShown ? C.HIDDEN_TEXT : ""}>
              {description}
            </span>
          )}
          {disabledHint !== undefined && (
            <span aria-hidden={!isHintShown} className={isHintShown ? "" : C.HIDDEN_TEXT}>
              {disabledHint}
            </span>
          )}
        </span>
      </div>
      {hasWideControl ? <div className={C.CONTROL_WIDE}>{children}</div> : children}
    </div>
  );
}

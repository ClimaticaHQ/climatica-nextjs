import { ESettingsControlPlacement } from "@/enums";
import { useIsWrapped } from "@/hooks/ui";
import { SETTINGS_CLASSES as C } from "../Settings.constant";
import type { TSettingsRowProps } from "../Settings.type";

/**
 * One row of a settings section: its label and description on the left, its control on the
 * right — or under them, by its placement; below `sm`, beside a wide control, the description
 * runs under both. Without a label, the control fills the row (a switch).
 */
export function SettingsRow({
  labelId,
  label,
  description,
  descriptionId,
  isDisabled = false,
  placement = ESettingsControlPlacement.FIT,
  children,
}: TSettingsRowProps) {
  const layout = C.PLACEMENT[placement];
  const { rowRef, itemRef, isWrapped } = useIsWrapped<HTMLDivElement, HTMLDivElement>();

  return (
    <div className={C.ROW}>
      {label === undefined ? (
        <div className={C.ROW_SELF_LABELLED}>{children}</div>
      ) : (
        <div ref={rowRef} className={`${C.ROW_CONTENT} ${layout.CONTENT}`}>
          <div className={`${C.TEXT} ${layout.TEXT}`}>
            <span
              id={labelId}
              className={`${C.LABEL} ${layout.LABEL} ${isDisabled ? C.DISABLED_LABEL : ""}`}
            >
              {label}
            </span>
            {description !== undefined && (
              <span id={descriptionId} className={`${C.DESCRIPTION} ${layout.DESCRIPTION}`}>
                {description}
              </span>
            )}
          </div>
          <div
            ref={itemRef}
            className={`${layout.CONTROL} ${isWrapped ? layout.CONTROL_WRAPPED : layout.CONTROL_BESIDE}`}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

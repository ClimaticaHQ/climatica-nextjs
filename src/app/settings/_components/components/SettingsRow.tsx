import { ESettingsControlPlacement } from "@/enums";
import { useIsWrapped } from "@/hooks/ui";
import { SETTINGS_CLASSES as C } from "../Settings.constant";
import type { TSettingsRowProps } from "../Settings.type";

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

import { ESegmentedSize } from "@/enums";
import { SEGMENTED_CONTROL_CLASSES as C } from "./SegmentedControl.constant";
import type { TSegmentedControlProps, TSegmentedRoomStyle } from "./SegmentedControl.type";
import { useIndicatorRect } from "./hooks/useIndicatorRect";
import { useSegmentLayout } from "./hooks/useSegmentLayout";

/**
 * A pill track of mutually exclusive options (icon + label; icon only below `sm` on request, or
 * one option per line below `sm` when a label doesn't fit inline, or labels cut to the room on
 * request). Each
 * option is a native toggle button, so Tab / Enter / Space work and aria-pressed reports it.
 * The active pill slides to the selected option.
 */
export function SegmentedControl<TValue extends string>({
  label,
  options,
  value,
  onChange,
  isDisabled = false,
  isFlat = false,
  isIconOnlyBelowSm = false,
  isLabelTruncated = false,
  size = ESegmentedSize.DEFAULT,
  ariaDescribedBy,
}: TSegmentedControlProps<TValue>) {
  const { trackRef, rect } = useIndicatorRect(value);
  const { isList, roomWidth } = useSegmentLayout(trackRef, !isIconOnlyBelowSm && !isLabelTruncated);
  const activeClass = isFlat ? C.ACTIVE_FLAT : C.ACTIVE;
  const trackClass = isIconOnlyBelowSm
    ? C.TRACK
    : `${C.TRACK_LABELLED} ${isLabelTruncated ? C.TRACK_TRUNCATED : ""}`;
  const labelShownClass = isLabelTruncated ? C.LABEL_TRUNCATED : C.LABEL_SHOWN;
  const labelClass = isIconOnlyBelowSm ? C.LABEL : labelShownClass;
  const roomStyle: TSegmentedRoomStyle = { "--segmented-room": `${roomWidth}px` };

  return (
    <div
      ref={trackRef}
      role="group"
      aria-label={label}
      aria-disabled={isDisabled || undefined}
      data-layout={isList ? "list" : "inline"}
      className={`${trackClass} ${isList ? C.TRACK_LIST : ""} ${isDisabled ? C.DISABLED : ""}`}
      style={isList ? roomStyle : undefined}
    >
      {/* * drawn once measured, so it never slides in from the track's edge on mount */}
      {rect && (
        <span
          aria-hidden
          className={`${C.INDICATOR} ${isFlat ? C.INDICATOR_FLAT : C.INDICATOR_RAISED} ${isList ? C.INDICATOR_LIST : ""}`}
          style={
            isList
              ? {
                  width: rect.width,
                  height: rect.height,
                  transform: `translate(${rect.left}px, ${rect.top}px)`,
                }
              : { width: rect.width, transform: `translateX(${rect.left}px)` }
          }
        />
      )}
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            disabled={isDisabled}
            aria-label={option.label}
            aria-describedby={ariaDescribedBy}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={`${C.OPTION} ${C.SIZE[size]} ${isList ? C.OPTION_LIST : ""} ${isLabelTruncated ? C.OPTION_TRUNCATED : ""} ${isActive ? activeClass : C.INACTIVE}`}
          >
            {option.icon}
            <span className={labelClass}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

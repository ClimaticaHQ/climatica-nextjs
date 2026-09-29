import { MOTION } from "@/constants";
import { SEGMENTED_CONTROL_CLASSES as C } from "./SegmentedControl.constant";
import type { TSegmentedControlProps } from "./SegmentedControl.type";
import { useIndicatorRect } from "./hooks/useIndicatorRect";

/**
 * A pill track of mutually exclusive options (icon + label, icon only below `sm`). Each
 * option is a native toggle button, so Tab / Enter / Space work and aria-pressed reports it.
 * The active pill slides to the selected option.
 */
export function SegmentedControl<TValue extends string>({
  label,
  options,
  value,
  onChange,
}: TSegmentedControlProps<TValue>) {
  const { trackRef, rect } = useIndicatorRect(value);

  return (
    <div ref={trackRef} role="group" aria-label={label} className={C.TRACK}>
      {/* * drawn once measured, so it never slides in from the track's edge on mount */}
      {rect && (
        <span
          aria-hidden
          className={C.INDICATOR}
          style={{
            width: rect.width,
            transform: `translateX(${rect.left}px)`,
            transitionDuration: `${MOTION.CONTROL_SLIDE_MS}ms`,
          }}
        />
      )}
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={`${C.OPTION} ${isActive ? C.ACTIVE : C.INACTIVE}`}
          >
            {option.icon}
            <span className={C.LABEL}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

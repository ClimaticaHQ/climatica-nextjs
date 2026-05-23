import { TRangeSliderProps } from "./RangeSlider.type";

export default function RangeSlider({
  min,
  max,
  step = 1,
  value,
  windowSize,
  onChange,
  ariaLabel,
  ariaValueText,
}: TRangeSliderProps) {
  const range = max - min;
  const startPercent = ((value - min) / range) * 100;
  const widthPercent = windowSize ? (windowSize / range) * 100 : 0;

  return (
    <div className="relative w-full h-6">
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-3 rounded-sm bg-[var(--color-border)]">
        <div
          className="absolute h-3 bg-[var(--color-primary)] transition-all duration-150"
          style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
        />
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        aria-valuetext={ariaValueText}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
}

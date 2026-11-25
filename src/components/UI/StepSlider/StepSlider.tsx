"use client";

import { getStepDotLeft, getStepFraction } from "@/utils/stepSlider.util";
import { useStepSlider } from "./hooks/useStepSlider";
import { STEP_SLIDER, STEP_SLIDER_CLASSES as C } from "./StepSlider.constant";
import type { TStepFillStyle, TStepSliderProps } from "./StepSlider.type";

export function StepSlider<TValue extends string>({
  label,
  steps,
  value,
  onChange,
  ariaDescribedBy,
  className = "",
}: TStepSliderProps<TValue>) {
  const { inputRef, index, handleInput, handleKeyDown } = useStepSlider({
    steps,
    value,
    onChange,
  });
  const fillStyle: TStepFillStyle = { "--step-fill": getStepFraction(index, steps.length) };

  return (
    <div data-step-slider className={`${C.ROOT} ${className}`}>
      <span aria-hidden className={C.SMALL_GLYPH}>
        A
      </span>
      <div className={C.TRACK_AREA}>
        <input
          ref={inputRef}
          type="range"
          min={0}
          max={steps.length - 1}
          step={1}
          value={index}
          aria-label={label}
          aria-valuetext={steps[index]?.label}
          aria-describedby={ariaDescribedBy}
          onChange={(event) => handleInput(Number(event.target.value))}
          onKeyDown={handleKeyDown}
          className={C.INPUT}
          style={fillStyle}
        />
        <span aria-hidden className={C.DOTS}>
          {steps.map(({ value: stepValue }, stepIndex) => (
            <span
              key={stepValue}
              data-step-dot
              className={`${C.DOT} ${
                stepIndex === index
                  ? C.DOT_UNDER_THUMB
                  : stepIndex < index
                    ? C.DOT_FILLED
                    : C.DOT_EMPTY
              }`}
              style={{
                left: getStepDotLeft({
                  fraction: getStepFraction(stepIndex, steps.length),
                  thumbSize: STEP_SLIDER.THUMB_PX,
                }),
              }}
            />
          ))}
        </span>
      </div>
      <span aria-hidden className={C.LARGE_GLYPH}>
        A
      </span>
    </div>
  );
}

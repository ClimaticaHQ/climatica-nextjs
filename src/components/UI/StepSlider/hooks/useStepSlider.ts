import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { STEP_SLIDER_KEYS } from "../StepSlider.constant";
import type { TStepSliderArgs, TStepSliderState } from "../StepSlider.type";

export function useStepSlider<TValue extends string>({
  steps,
  value,
  onChange,
}: TStepSliderArgs<TValue>): TStepSliderState {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<number | null>(null);
  const last = steps.length - 1;
  const index =
    draft ??
    Math.max(
      steps.findIndex((step) => step.value === value),
      0,
    );

  const commit = (next: number) => {
    setDraft(null);
    const step = steps[Math.min(Math.max(next, 0), last)];
    if (step && step.value !== value) onChange(step.value);
  };
  // * the latest commit for the native listener, which is added once
  const commitRef = useRef(commit);
  useLayoutEffect(() => {
    commitRef.current = commit;
  });

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const handleRelease = () => commitRef.current(Number(input.value));
    input.addEventListener("change", handleRelease);
    return () => input.removeEventListener("change", handleRelease);
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const targets: Partial<Record<string, number>> = {
      Home: 0,
      End: last,
      ...Object.fromEntries(
        Object.entries(STEP_SLIDER_KEYS).map(([key, delta]) => [key, index + delta]),
      ),
    };
    const target = targets[event.key];
    if (target === undefined) return;
    // * the native keyboard step would only fire input and change; this applies it the same way
    event.preventDefault();
    commit(target);
  };

  return { inputRef, index, handleInput: setDraft, handleKeyDown };
}

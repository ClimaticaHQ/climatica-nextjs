import { WALTER_LIETH_AXIS } from "@/constants";
import type { TRoundTicksArgs, TTemperatureAxisArgs } from "@/types";

export function getRoundTicks({ min, max, maxCount, steps }: TRoundTicksArgs): number[] {
  const countAt = (step: number) => Math.floor(max / step) - Math.ceil(min / step) + 1;
  const step = steps.find((candidate) => countAt(candidate) <= maxCount) ?? steps.at(-1) ?? 1;
  const first = Math.ceil(min / step);
  // * + 0: never a -0 tick
  return Array.from({ length: Math.max(countAt(step), 0) }, (_, i) => (first + i) * step + 0);
}

export function getTemperatureTicks(
  min: number,
  max: number,
  maxCount: number = WALTER_LIETH_AXIS.TEMP_MAX_TICKS,
) {
  return getRoundTicks({ min, max, maxCount, steps: WALTER_LIETH_AXIS.TEMP_TICK_STEPS });
}

export function getTemperatureAxis({ min, max, maxCount }: TTemperatureAxisArgs) {
  const steps = WALTER_LIETH_AXIS.TEMP_TICK_STEPS;
  // * + 0: never a -0 end
  const rounded = (step: number) => {
    const low = Math.floor(min / step) * step + 0;
    const high = Math.max(Math.ceil(max / step) * step, low + step) + 0;
    return [low, high] as const;
  };
  const countAt = (step: number) => {
    const [low, high] = rounded(step);
    return (high - low) / step + 1;
  };
  const step = steps.find((candidate) => countAt(candidate) <= maxCount) ?? steps.at(-1) ?? 1;
  const domain = rounded(step);
  return {
    domain,
    ticks: getRoundTicks({ min: domain[0], max: domain[1], maxCount: Infinity, steps: [step] }),
  };
}

export function getPrecipitationTicks(
  max: number,
  maxCount: number = WALTER_LIETH_AXIS.PREC_MAX_TICKS,
) {
  const steps = WALTER_LIETH_AXIS.PREC_TICK_STEPS;
  const tickCountAt = (step: number) => Math.ceil(max / step) + 1;
  const step = steps.find((candidate) => tickCountAt(candidate) <= maxCount) ?? steps.at(-1) ?? 1;
  const top = Math.max(Math.ceil(max / step), 1) * step;
  return getRoundTicks({ min: 0, max: top, maxCount, steps: [step] });
}

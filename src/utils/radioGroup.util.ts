import type { TRadioGroupKeyArgs } from "@/types";

const RADIO_GROUP_MOVES: Partial<Record<string, (index: number, count: number) => number>> = {
  ArrowRight: (index, count) => (index + 1) % count,
  ArrowDown: (index, count) => (index + 1) % count,
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  ArrowUp: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_index, count) => count - 1,
};

/**
 * The option a key moves a radio group's selection to: the arrows step, wrapping at the ends;
 * Home / End jump to them. Null: a key the group leaves alone.
 */
export function getRadioGroupIndex({ key, index, count }: TRadioGroupKeyArgs): number | null {
  const move = RADIO_GROUP_MOVES[key];
  return move && count > 0 ? move(Math.max(index, 0), count) : null;
}

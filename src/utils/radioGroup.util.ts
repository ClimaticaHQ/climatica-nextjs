import type { TRadioGroupKeyArgs } from "@/types";

const RADIO_GROUP_MOVES: Partial<Record<string, (index: number, count: number) => number>> = {
  ArrowRight: (index, count) => (index + 1) % count,
  ArrowDown: (index, count) => (index + 1) % count,
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  ArrowUp: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_index, count) => count - 1,
};

export function getRadioGroupIndex({ key, index, count }: TRadioGroupKeyArgs): number | null {
  const move = RADIO_GROUP_MOVES[key];
  return move && count > 0 ? move(Math.max(index, 0), count) : null;
}

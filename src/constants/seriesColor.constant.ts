import { EWalterLiethSeriesId } from "@/enums";

/** The series colour tokens, by position — read only through seriesColor.util. */
export const SERIES_COLOR_TOKENS = {
  // * one line colour per series, by its place in the list: compared weather years — the first
  // * two are the pair's A and B, so they look the same on every comparison page
  LIST: [
    "--color-series-1",
    "--color-series-2",
    "--color-series-3",
    "--color-series-4",
    "--color-series-5",
  ],
  // * its bar colour, by the same place: a quieter step of the same hue
  BAR_LIST: [
    "--color-series-1-bar",
    "--color-series-2-bar",
    "--color-series-3-bar",
    "--color-series-4-bar",
    "--color-series-5-bar",
  ],
  // * a listed series' badge, by the same place: its hue's tint set, and its dot (a step darker
  // * than the line where the line misses 3:1 on the tint)
  TINT_LIST: [
    {
      bg: "--color-series-1-tint-bg",
      border: "--color-series-1-tint-border",
      text: "--color-series-1-tint-text",
      dot: "--color-series-1-tint-dot",
    },
    {
      bg: "--color-series-2-tint-bg",
      border: "--color-series-2-tint-border",
      text: "--color-series-2-tint-text",
      dot: "--color-series-2-tint-dot",
    },
    {
      bg: "--color-series-3-tint-bg",
      border: "--color-series-3-tint-border",
      text: "--color-series-3-tint-text",
      dot: "--color-series-3-tint-dot",
    },
    {
      bg: "--color-series-4-tint-bg",
      border: "--color-series-4-tint-border",
      text: "--color-series-4-tint-text",
      dot: "--color-series-4-tint-dot",
    },
    {
      bg: "--color-series-5-tint-bg",
      border: "--color-series-5-tint-border",
      text: "--color-series-5-tint-text",
      dot: "--color-series-5-tint-dot",
    },
  ],
  // * a compared pair (A, B) — series 1 and 2: its lines, markers and identity; its bars
  PAIR: {
    [EWalterLiethSeriesId.A]: { line: "--color-series-1", bar: "--color-series-1-bar" },
    [EWalterLiethSeriesId.B]: { line: "--color-series-2", bar: "--color-series-2-bar" },
  },
} as const;

// * text below large-text size takes the text colour, never a series colour: the series shows by
// * its marker (docs/colors.md)
export const SERIES_TEXT_COLOR = "var(--color-text)";

import { MARTONNE_CLASSES, MARTONNE_SCALE_TEXT } from "@/constants";
import messages from "@/i18n/locales/en.json";
import { buildMartonneTooltip, formatMartonneScale } from "@/utils/martonne.util";
import type { TTranslate } from "@/types";
import { createTranslator, type Messages } from "next-intl";
import { describe, expect, it } from "vitest";

const translate: TTranslate = createTranslator<Messages>({ locale: "en", messages });
const echo = (key: string) => key;

// * "<10 martonne.arid" → { min: null, max: 10, label: "martonne.arid" }
function parseClass(text: string) {
  const { BELOW, ABOVE, RANGE } = MARTONNE_SCALE_TEXT;
  const [bounds = "", ...label] = text.split(" ");
  const [low, high] = bounds.startsWith(BELOW)
    ? [null, bounds.slice(BELOW.length)]
    : bounds.startsWith(ABOVE)
      ? [bounds.slice(ABOVE.length), null]
      : bounds.split(RANGE);
  return {
    min: low === null || low === undefined ? null : Number(low),
    max: high === null || high === undefined ? null : Number(high),
    label: label.join(" "),
  };
}

describe("De Martonne tooltip scale", () => {
  it("lists every class of MARTONNE_CLASSES, in order, with its bounds and label", () => {
    const listed = formatMartonneScale(echo)
      .split(MARTONNE_SCALE_TEXT.CLASS_SEPARATOR)
      .map(parseClass);
    const expected = Object.values(MARTONNE_CLASSES).map((martonneClass) => ({
      min: "min" in martonneClass ? martonneClass.min : null,
      max: "max" in martonneClass ? martonneClass.max : null,
      label: martonneClass.labelKey,
    }));
    expect(listed).toEqual(expected);
  });

  it("writes the translated class labels", () => {
    expect(formatMartonneScale(translate)).toBe(
      "<10 Arid | 10–20 Semi-arid | 20–24 Mediterranean | 24–28 Semi-humid | 28–35 Humid | 35–55 Very-humid | >55 Extremely humid",
    );
  });

  it("follows the locale's sentence, which no longer lists classes itself", () => {
    const sentence = translate("chart.martonneTooltip");
    expect(sentence).not.toMatch(/\|/);
    expect(buildMartonneTooltip(sentence, translate)).toBe(
      `${sentence} ${formatMartonneScale(translate)}`,
    );
  });
});

import { MARTONNE_CLASSES, MARTONNE_SCALE_TEXT } from "@/constants";
import type { TMartonnClass } from "@/constants/martonne.constant";
import type { TMartonneBadge, TTranslate } from "@/types";

export function getMartonneBadge(idm: number): TMartonneBadge {
  const key = getMartonnClass(idm);
  const { labelKey, tone } = MARTONNE_CLASSES[key];
  return { labelKey, tone };
}

export function getMartonneLabelKey(idm: number): string {
  return getMartonneBadge(idm).labelKey;
}

function getMartonnClass(idm: number): TMartonnClass {
  if (idm < 10) return "arid";
  if (idm < 20) return "semiArid";
  if (idm < 24) return "mediterranean";
  if (idm < 28) return "semiHumid";
  if (idm < 35) return "humid";
  if (idm <= 55) return "veryHumid";
  return "extremelyHumid";
}

/** A class's bounds as the tooltip writes them: "<10", "10–20", ">55". */
function formatClassBounds(martonneClass: (typeof MARTONNE_CLASSES)[TMartonnClass]): string {
  const { BELOW, ABOVE, RANGE } = MARTONNE_SCALE_TEXT;
  const min = "min" in martonneClass ? martonneClass.min : null;
  const max = "max" in martonneClass ? martonneClass.max : null;
  if (min === null) return `${BELOW}${max}`;
  if (max === null) return `${ABOVE}${min}`;
  return `${min}${RANGE}${max}`;
}

/** Every De Martonne class with its bounds and translated label, in MARTONNE_CLASSES' order. */
export function formatMartonneScale(translate: TTranslate): string {
  return Object.values(MARTONNE_CLASSES)
    .map(
      (martonneClass) => `${formatClassBounds(martonneClass)} ${translate(martonneClass.labelKey)}`,
    )
    .join(MARTONNE_SCALE_TEXT.CLASS_SEPARATOR);
}

/** The stats bar's tooltip: the locale's sentence about the index, then its classes. */
export function buildMartonneTooltip(sentence: string, translate: TTranslate): string {
  return `${sentence}${MARTONNE_SCALE_TEXT.LEAD_SEPARATOR}${formatMartonneScale(translate)}`;
}

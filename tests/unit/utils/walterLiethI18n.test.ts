import { WALTER_LIETH_GUIDE_ITEMS } from "@/components/WalterLiethGuide/WalterLiethGuide.constant";
import { describe, expect, it } from "vitest";
import de from "@/i18n/locales/de.json";
import el from "@/i18n/locales/el.json";
import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import fr from "@/i18n/locales/fr.json";
import it_ from "@/i18n/locales/it.json";
import pt from "@/i18n/locales/pt.json";
import uk from "@/i18n/locales/uk.json";

const LOCALES = { de, el, en, es, fr, it: it_, pt, uk };
// * messages aren't typed, so a key missing from one locale would only show up at runtime
const WL_KEYS = Object.keys(en.chart).filter(
  (key) => key.startsWith("wl") || key.startsWith("layout") || key === "perhumidPeriod",
);

describe("Walter-Lieth i18n keys", () => {
  it("covers the keys this feature added", () => {
    expect(WL_KEYS).toEqual(
      expect.arrayContaining([
        "wlAriaSummary",
        "layout",
        "layoutSplit",
        "layoutOverlay",
        "wlShading",
        "perhumidPeriod",
        "wlGuideButton",
        "wlGuide",
      ]),
    );
  });

  it.each(Object.entries(LOCALES))("%s has every WL key, non-empty", (_, messages) => {
    const chart: Record<string, unknown> = messages.chart;
    const guide: Record<string, unknown> = messages.chart.wlGuide;
    const isText = (value: unknown) => typeof value === "string" && value !== "";
    WL_KEYS.filter((key) => key !== "wlGuide").forEach((key) => {
      expect(isText(chart[key])).toBe(true);
    });
    // * the "how to read" guide's points, one per WALTER_LIETH_GUIDE_ITEMS key
    WALTER_LIETH_GUIDE_ITEMS.forEach((key) => expect(isText(guide[key])).toBe(true));
  });
});

describe("export i18n keys", () => {
  it.each(Object.entries(LOCALES))(
    "%s explains why the export is disabled for incomplete data",
    (_, messages) => {
      const exportMenu: Record<string, unknown> = messages.exportMenu;
      expect(
        typeof exportMenu["incompleteData"] === "string" && exportMenu["incompleteData"] !== "",
      ).toBe(true);
    },
  );
});

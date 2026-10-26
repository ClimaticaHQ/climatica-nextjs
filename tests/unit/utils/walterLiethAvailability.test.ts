import { DATASETS } from "@/constants";
import { EFilterAvailability, EFilterKey, EFilterView } from "@/enums";
import { isWalterLiethShown } from "@/utils/chartMode.util";
import { getChipFilterKeys, getFilterAvailability } from "@/utils/filters.util";
import { describe, expect, it } from "vitest";

const CITY = "/climate-statistics";

describe("filters follow the Walter-Lieth diagram, for both datasets", () => {
  for (const dataset of [DATASETS.CLIMATE, DATASETS.WEATHER]) {
    it(`${dataset}: Walter-Lieth drawn — variables and months disabled, still chips`, () => {
      const isWalterLieth = isWalterLiethShown({
        pathname: CITY,
        searchParams: new URLSearchParams(),
      });
      expect(isWalterLieth).toBe(true);
      const context = { view: EFilterView.CLIMATE_STATISTICS, dataset, isWalterLieth };
      expect(getFilterAvailability(EFilterKey.VARIABLES, context)).toBe(
        EFilterAvailability.WALTER_LIETH,
      );
      expect(getFilterAvailability(EFilterKey.MONTHS, context)).toBe(
        EFilterAvailability.WALTER_LIETH,
      );
      expect(getChipFilterKeys(context)).toContain(EFilterKey.VARIABLES);
    });
  }

  it("the standard chart frees them, with Weather too", () => {
    const isWalterLieth = isWalterLiethShown({
      pathname: CITY,
      searchParams: new URLSearchParams("chart=standard"),
    });
    const context = {
      view: EFilterView.CLIMATE_STATISTICS,
      dataset: DATASETS.WEATHER,
      isWalterLieth,
    };
    expect(getFilterAvailability(EFilterKey.MONTHS, context)).toBe(EFilterAvailability.AVAILABLE);
  });
});

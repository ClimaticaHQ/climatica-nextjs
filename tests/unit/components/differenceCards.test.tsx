// @vitest-environment jsdom
import { CityDifferenceCards } from "@/app/compare-cities/_components/CityDifferenceCards";
import { PeriodTrendCards } from "@/app/compare-periods/_components/PeriodTrendCards";
import messages from "@/i18n/locales/en.json";
import type { TDiffStats } from "@/types";
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { stubChartEnvironment } from "../charts/chartTestEnv";

const wrap = (node: ReactNode) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {node}
    </NextIntlClientProvider>,
  );

// * the stat cards read the reduced-motion setting
beforeEach(stubChartEnvironment);
afterEach(cleanup);

describe("PeriodTrendCards", () => {
  it("shows the difference of the displayed values, and no change when they're equal", () => {
    wrap(
      <PeriodTrendCards
        trend={{
          // * 6.0 and 4.9 shown in the stats table: +1.1, not +1.0
          tmax: { minuend: 5.96, subtrahend: 4.94 },
          // * 405 and 405 shown: no change, though the totals differ by 0.8 mm
          prec: { minuend: 405.4, subtrahend: 404.6 },
          labelA: "1961–1990",
          labelB: "1991–2020",
        }}
      />,
    );
    expect(screen.getByText("+1.1°C")).toBeTruthy();
    expect(screen.getByText("No change")).toBeTruthy();
  });
});

describe("CityDifferenceCards", () => {
  const diff: TDiffStats = {
    warmerCity: "B",
    // * 17.5 and 18.5 shown: 1.0 apart, though the exact gap is 1.08
    avgTmax: { minuend: 17.46, subtrahend: 18.54 },
    moreRainCity: "A",
    totalPrec: { minuend: 600.6, subtrahend: 480.4 },
    hottestMonthIndex: 6,
    hottestTempA: 29.94,
    hottestTempB: 31.06,
    coldestMonthIndex: 0,
    coldestTempA: 8.04,
    coldestTempB: -1.96,
  };

  it("gives the gap between the displayed values, unsigned", () => {
    wrap(<CityDifferenceCards differences={{ diff, labelA: "Rome", labelB: "Seville" }} />);
    expect(screen.getByText("by 1.0°C")).toBeTruthy();
    expect(screen.getByText("by 121 mm")).toBeTruthy();
    expect(screen.getByText("Rome: 29.9°C / Seville: 31.1°C")).toBeTruthy();
  });
});

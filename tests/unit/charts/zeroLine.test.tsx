// @vitest-environment jsdom
import { StandardChartAxes } from "@/components/charts/StandardChartAxes";
import { CHART_ZERO_LINE, WALTER_LIETH_MONTH_FORMAT } from "@/constants";
import messages from "@/i18n/locales/en.json";
import type { TWalterLiethScales } from "@/types";
import { crossesZeroTemperature } from "@/utils";
import { cleanup, render, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ComposedChart, Line } from "recharts";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { months } from "./chartFixtures";
import { stubChartEnvironment } from "./chartTestEnv";

beforeEach(stubChartEnvironment);
afterEach(cleanup);

const scalesOf = (tempMin: number, tempMax: number): TWalterLiethScales => ({
  tempMin,
  tempMax,
  precMin: tempMin * 2,
  precMax: tempMax * 2,
  plotMax: tempMax,
});

const DOMAINS = [
  { name: "crosses 0", scales: scalesOf(-10, 30), hasLine: true },
  { name: "is entirely above 0", scales: scalesOf(0, 30), hasLine: false },
  { name: "is entirely below 0", scales: scalesOf(-30, -5), hasLine: false },
  { name: "is unknown", scales: null, hasLine: false },
] as const;

function renderAxes(scales: TWalterLiethScales | null) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ComposedChart width={600} height={300} data={months(0)}>
        <StandardChartAxes
          scales={scales}
          rightMax={100}
          isCompact={false}
          monthFormat={WALTER_LIETH_MONTH_FORMAT.WIDE}
        />
        <Line yAxisId="temp" dataKey="tmax" />
      </ComposedChart>
    </NextIntlClientProvider>,
  );
}

describe("the standard chart's 0 °C line", () => {
  for (const { name, scales, hasLine } of DOMAINS) {
    it(`${hasLine ? "is drawn" : "is not drawn"} when the °C domain ${name}`, async () => {
      expect(crossesZeroTemperature(scales)).toBe(hasLine);
      const { container } = renderAxes(scales);
      // * Recharts draws its layers after the first commit
      await waitFor(() => expect(container.querySelector(".recharts-line")).not.toBeNull());
      const line = container.querySelector(".chart-zero-line line");
      expect(line !== null).toBe(hasLine);
      if (line !== null) {
        expect(line.getAttribute("stroke")).toBe(CHART_ZERO_LINE.STROKE);
        expect(line.getAttribute("stroke-dasharray")).toBe(CHART_ZERO_LINE.DASH);
      }
    });
  }
});

// @vitest-environment jsdom
import { PageLayout } from "@/components/page";
import { EDataStatus } from "@/enums";
import messages from "@/i18n/locales/en.json";
import type { TDataState } from "@/types";
import { cleanup, render, screen } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

function renderLayout(state: TDataState) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <PageLayout
        title="Compare Cities"
        description="Two places side by side"
        controls={<div>controls</div>}
        state={state}
        summary={<div>summary</div>}
        main={<div>main</div>}
        details={<div>details</div>}
      />
    </NextIntlClientProvider>,
  );
}

describe("PageLayout", () => {
  it("one order on every page: header, controls, results (summary, main, details)", () => {
    const { container } = renderLayout({ status: EDataStatus.READY });
    const text = container.textContent ?? "";
    const order = ["Compare Cities", "controls", "summary", "main", "details"].map((part) =>
      text.indexOf(part),
    );
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Compare Cities");
  });

  it("an error shows its translated message for the cause, never the error's text", () => {
    const error = new AxiosError(
      "Request failed with status code 502",
      "ERR_BAD_RESPONSE",
      undefined,
      undefined,
      {
        status: 502,
        statusText: "Bad Gateway",
        data: { error: "WorldClim API request failed" },
        headers: {},
        config: { headers: new AxiosHeaders() },
      },
    );
    renderLayout({ status: EDataStatus.ERROR, error });
    expect(screen.getByRole("alert").textContent).toBe(messages.errors.dataSourceUnavailable);
    expect(document.body.textContent).not.toContain("status code 502");
  });

  it("an empty result shows the page's message; loading and ready show none", () => {
    renderLayout({ status: EDataStatus.EMPTY, message: "No data for 1970–2000 at 10′" });
    expect(screen.getByText("No data for 1970–2000 at 10′")).toBeTruthy();
    cleanup();
    renderLayout({ status: EDataStatus.LOADING });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("leaves no empty results frame behind when every region draws nothing", () => {
    const Nothing = () => null;
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <PageLayout
          title="City Climate"
          description=""
          controls={null}
          state={{ status: EDataStatus.EMPTY, message: "No data" }}
          summary={<Nothing />}
          main={<Nothing />}
        />
      </NextIntlClientProvider>,
    );
    // * no child draws anything: the frame isn't laid out (its :has rule), so no gap remains
    const results = screen.getByTestId("page-results");
    expect(results.matches(":has(> :not(:empty))")).toBe(false);
    expect(results.className).toContain("has-[>:not(:empty)]:flex");
  });
});

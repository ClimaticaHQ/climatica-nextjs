// @vitest-environment jsdom
import { HowToCite } from "@/components/info/parts/HowToCite";
import messages from "@/i18n/locales/en.json";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubChartEnvironment } from "../charts/chartTestEnv";

const writeText = vi.fn<(text: string) => Promise<void>>();
const wrap = (node: ReactNode) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {node}
    </NextIntlClientProvider>,
  );

beforeEach(() => {
  stubChartEnvironment();
  writeText.mockReset().mockResolvedValue();
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
});
afterEach(cleanup);

describe("HowToCite", () => {
  it("shows the citation and says when it was copied", async () => {
    wrap(<HowToCite citation="Kononenko, A. (2026). Climatica." bibtex="@article{x}" />);
    expect(screen.getByText("Kononenko, A. (2026). Climatica.")).toBeTruthy();

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy citation" })));
    expect(writeText).toHaveBeenCalledWith("Kononenko, A. (2026). Climatica.");
    expect(screen.getByRole("status").textContent).toBe("Copied to the clipboard");

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy BibTeX" })));
    expect(writeText).toHaveBeenLastCalledWith("@article{x}");
  });

  it("leaves out the BibTeX button until a BibTeX is configured", () => {
    wrap(<HowToCite citation="Climatica." bibtex="" />);
    expect(screen.queryByRole("button", { name: "Copy BibTeX" })).toBeNull();
  });
});

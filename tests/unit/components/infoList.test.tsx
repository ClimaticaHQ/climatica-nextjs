// @vitest-environment jsdom
import { InfoList } from "@/components/info/parts/InfoList";
import { CodeIcon } from "@/components/svg";
import messages from "@/i18n/locales/en.json";
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

const wrap = (node: ReactNode) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {node}
    </NextIntlClientProvider>,
  );

afterEach(cleanup);

describe("InfoList", () => {
  it("is a bullet list by default and a numbered one when asked", () => {
    const items = [{ key: "a", text: "First" }];
    const { container, unmount } = wrap(<InfoList items={items} />);
    expect(container.querySelector("ul")?.className).toContain("list-disc");
    unmount();
    const numbered = wrap(<InfoList items={items} isNumbered />);
    expect(numbered.container.querySelector("ol")?.className).toContain("list-decimal");
  });

  it("puts an icon before an item's text, without bullets", () => {
    const { container } = wrap(
      <InfoList items={[{ key: "split", text: "Side by side", icon: CodeIcon }]} />,
    );
    expect(container.querySelector("ul")?.className).not.toContain("list-disc");
    const item = screen.getByRole("listitem");
    expect(item.querySelector("svg")).not.toBeNull();
    expect(item.textContent).toBe("Side by side");
  });

  it("ends an item with its link to another site", () => {
    wrap(
      <InfoList
        isNumbered
        items={[
          {
            key: "fick",
            text: "Fick (2017).",
            link: { href: "https://doi.org/10.1002/joc.5086", label: "doi:10.1002/joc.5086" },
          },
        ]}
      />,
    );
    const link = screen.getByRole("link", { name: /doi:10\.1002\/joc\.5086/ });
    expect(link.getAttribute("href")).toBe("https://doi.org/10.1002/joc.5086");
    expect(screen.getByRole("listitem").textContent).toMatch(/^Fick \(2017\)\. doi:/);
  });
});

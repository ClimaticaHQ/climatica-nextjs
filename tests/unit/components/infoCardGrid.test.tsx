// @vitest-environment jsdom
import { InfoCardGrid } from "@/components/info/parts/InfoCardGrid";
import { CodeIcon } from "@/components/svg";
import { EInfoCardLayout } from "@/enums";
import messages from "@/i18n/locales/en.json";
import { cleanup, render, screen, within } from "@testing-library/react";
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

// * Card reads the motion setting
beforeEach(stubChartEnvironment);
afterEach(cleanup);

describe("InfoCardGrid", () => {
  it("fills a stack card's slots in order: icon, eyebrow, title, formula, text, body, note, link", () => {
    const { container } = wrap(
      <InfoCardGrid
        columns={2}
        items={[
          {
            key: "full",
            icon: CodeIcon,
            eyebrow: "Service",
            title: "SCRAPI",
            formula: "P < 2T",
            text: "The text",
            body: <p>The body</p>,
            note: "A citation",
            link: { href: "https://example.org", label: "Visit" },
          },
        ]}
      />,
    );
    const card = within(screen.getByRole("listitem"));
    expect(card.getByRole("heading", { level: 3 }).textContent).toBe("SCRAPI");
    expect(card.getByText("P < 2T").tagName).toBe("CODE");
    expect(card.getByText("A citation").className).toContain("italic");
    const link = card.getByRole("link", { name: /Visit/ });
    expect(link.getAttribute("href")).toBe("https://example.org");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(container.querySelector("svg")).not.toBeNull();
    const text = container.textContent ?? "";
    const order = ["Service", "SCRAPI", "P < 2T", "The text", "The body", "A citation", "Visit"];
    const positions = order.map((part) => text.indexOf(part));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("leaves out the slots an item doesn't have", () => {
    const { container } = wrap(
      <InfoCardGrid columns={1} items={[{ key: "plain", title: "Only a title" }]} />,
    );
    expect(container.querySelector("svg, code, a, p")).toBeNull();
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("Only a title");
  });

  it("links the title to a page of the app", () => {
    wrap(
      <InfoCardGrid
        columns={2}
        items={[{ key: "cities", title: "Compare Cities", titleHref: "/compare-cities" }]}
      />,
    );
    const link = screen.getByRole("link", { name: "Compare Cities" });
    expect(link.getAttribute("href")).toBe("/compare-cities");
    expect(link.hasAttribute("target")).toBe(false);
  });

  it("draws a ROW card's number badge beside its title and text, and steps as a list in order", () => {
    const { container } = wrap(
      <InfoCardGrid
        columns={2}
        isOrdered
        layout={EInfoCardLayout.ROW}
        items={[{ key: "name", number: "1", title: "Search by name", text: "Type a city" }]}
      />,
    );
    expect(container.querySelector("ol")).not.toBeNull();
    const badge = screen.getByText("1");
    expect(badge.getAttribute("aria-hidden")).toBe("true");
    expect(badge.nextElementSibling?.textContent).toBe("Search by nameType a city");
  });

  it("highlights a card when asked", () => {
    const { container } = wrap(
      <InfoCardGrid
        columns={1}
        items={[{ key: "x", title: "Highlighted", isHighlighted: true }]}
      />,
    );
    expect(container.querySelector("li > div")?.className).toContain("--color-primary-muted");
  });
});

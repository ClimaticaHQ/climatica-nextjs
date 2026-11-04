// @vitest-environment jsdom
import { Card } from "@/components/Card";
import { StatCard } from "@/components/StatCard";
import { Button, Disclosure } from "@/components/UI";
import { getButtonVariantStyles } from "@/components/UI/Button/Button.util";
import { ECardBackground, EButtonVariant, EStatLabelSize } from "@/enums";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { stubChartEnvironment } from "../charts/chartTestEnv";

// * Card reads the motion setting
beforeEach(stubChartEnvironment);
afterEach(cleanup);

describe("Button href", () => {
  it("renders a link with the variant's look when given an href", () => {
    render(
      <Button variant={EButtonVariant.PRIMARY} href="/about/guide" className="px-4">
        Read the guide
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Read the guide" });
    expect(link.getAttribute("href")).toBe("/about/guide");
    expect(link.className).toContain(getButtonVariantStyles(EButtonVariant.PRIMARY));
    expect(link.className).toContain("px-4");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("stays a button without one", () => {
    render(<Button variant={EButtonVariant.SECONDARY}>Copy</Button>);
    const button = screen.getByRole("button", { name: "Copy" });
    expect(button.getAttribute("type")).toBe("button");
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("Card HIGHLIGHT", () => {
  it("fills the card with the muted primary; the default background is unchanged", () => {
    const { container } = render(
      <>
        <Card background={ECardBackground.HIGHLIGHT}>highlighted</Card>
        <Card>plain</Card>
      </>,
    );
    const [highlighted, plain] = Array.from(container.children);
    expect(highlighted?.className).toContain("bg-[var(--color-primary-muted)]");
    expect(plain?.className).toContain("bg-[var(--color-surface)]");
    expect(plain?.className).not.toContain("primary-muted");
  });
});

describe("Disclosure", () => {
  it("is closed by default and opens from its summary", () => {
    const { container } = render(
      <Disclosure summary="Why do values change?" id="why">
        <p>Because cells differ.</p>
      </Disclosure>,
    );
    const details = container.querySelector("details");
    expect(details?.id).toBe("why");
    expect(details?.open).toBe(false);
    fireEvent.click(screen.getByText("Why do values change?"));
    expect(details?.open).toBe(true);
  });
});

describe("StatCard labelSize", () => {
  it("keeps the app's small label by default and takes the larger one when asked", () => {
    render(
      <>
        <StatCard label="Default" value="4" sub="sub a" />
        <StatCard label="Reading" value="5" sub="sub b" labelSize={EStatLabelSize.BASE} />
      </>,
    );
    expect(screen.getByText("Default").className).toContain("--font-xs");
    expect(screen.getByText("sub a").className).toContain("--font-xs");
    expect(screen.getByText("Reading").className).toContain("--font-base");
    expect(screen.getByText("sub b").className).toContain("--font-base");
  });
});

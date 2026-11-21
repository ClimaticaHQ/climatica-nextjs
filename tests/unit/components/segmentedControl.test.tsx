// @vitest-environment jsdom
import { SegmentedControl } from "@/components/SegmentedControl";
import { SEGMENTED_CONTROL_CLASSES as C } from "@/components/SegmentedControl/SegmentedControl.constant";
import { ESegmentedSize } from "@/enums";
import { getSegmentsFitInline } from "@/utils/segmentedControl.util";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const OPTIONS = [
  { value: "light", label: "Light", icon: null },
  { value: "dark", label: "Dark", icon: null },
] as const;

beforeEach(() => {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
afterEach(cleanup);

const optionClasses = (size?: ESegmentedSize) => {
  render(
    <SegmentedControl
      label="Theme"
      options={OPTIONS}
      value="light"
      onChange={() => {}}
      size={size}
    />,
  );
  return (screen.getByRole("button", { name: "Light" }).getAttribute("class") ?? "").split(" ");
};

const labelClass = (isIconOnlyBelowSm?: boolean) => {
  render(
    <SegmentedControl
      label="Theme"
      options={OPTIONS}
      value="light"
      onChange={() => {}}
      isIconOnlyBelowSm={isIconOnlyBelowSm}
    />,
  );
  return screen.getByText("Light").getAttribute("class") ?? "";
};

describe("SegmentedControl sizes", () => {
  it("is a 44px pill below `sm` without a size prop", () => {
    const classes = optionClasses();
    expect(classes).toContain("max-sm:min-h-target");
    expect(classes).not.toContain("touch-target");
  });

  it("compact: a shorter pill below `sm`, its 44px target drawn around it", () => {
    const classes = optionClasses(ESegmentedSize.COMPACT);
    expect(classes).toEqual(
      expect.arrayContaining(["max-sm:min-h-[max(2rem,32px)]", "touch-target"]),
    );
    expect(classes).not.toContain("max-sm:min-h-target");
  });

  it("sizes its icons by the label's text", () => {
    expect(optionClasses()).toEqual(
      expect.arrayContaining(["[&>svg]:size-[1.15em]", "gap-[0.4em]"]),
    );
  });
});

describe("SegmentedControl labels", () => {
  it("always shows its labels on one line, never cut or broken", () => {
    const classes = labelClass();
    expect(classes).toBe(C.LABEL_SHOWN);
    expect(classes).toContain("whitespace-nowrap");
    expect(classes).not.toContain("sr-only");
    expect(classes).not.toContain("truncate");
  });

  it("drops them below `sm` only when asked (a chart toolbar)", () => {
    expect(labelClass(true)).toBe(C.LABEL);
    expect(C.LABEL).toContain("max-sm:sr-only");
  });

  it("cuts them to the room when asked, never a list, the full label the option's name", () => {
    const longLabel = "Valladolid de los Caballeros";
    render(
      <SegmentedControl
        label="Place"
        options={[
          { value: "0", label: longLabel, icon: null },
          { value: "1", label: "Oslo", icon: null },
        ]}
        value="0"
        onChange={() => {}}
        isLabelTruncated
      />,
    );
    const group = screen.getByRole("group", { name: "Place" });
    expect(group.getAttribute("data-layout")).toBe("inline");
    expect(group.getAttribute("class")).toContain(C.TRACK_TRUNCATED);
    const option = screen.getByRole("button", { name: longLabel });
    expect(option.getAttribute("title")).toBe(longLabel);
    expect(option.getAttribute("class")).toContain(C.OPTION_TRUNCATED);
    expect(screen.getByText(longLabel).getAttribute("class")).toBe(C.LABEL_TRUNCATED);
  });
});

describe("SegmentedControl option icons", () => {
  it("draws each option's icon before its label, hidden from the accessible name", () => {
    render(
      <SegmentedControl
        label="Place"
        options={[
          { value: "0", label: "Bolzano", icon: <svg data-testid="icon-0" aria-hidden="true" /> },
          { value: "1", label: "Verona", icon: <svg data-testid="icon-1" aria-hidden="true" /> },
        ]}
        value="0"
        onChange={() => {}}
      />,
    );
    const option = screen.getByRole("button", { name: "Bolzano" });
    expect(option.firstElementChild).toBe(screen.getByTestId("icon-0"));
    expect(screen.getByRole("button", { name: "Verona" }).firstElementChild).toBe(
      screen.getByTestId("icon-1"),
    );
  });
});

describe("whether the options fit inline", () => {
  const ARGS = { labelWidths: [40, 60, 80], segmentExtra: 40, trackExtra: 10 };

  it("fits while the longest label and its icon fit an equal share of the room", () => {
    expect(getSegmentsFitInline({ ...ARGS, availableWidth: 10 + 3 * 120 })).toBe(true);
  });

  it("goes to the list as soon as one segment can't hold its label on one line", () => {
    expect(getSegmentsFitInline({ ...ARGS, availableWidth: 10 + 3 * 119 })).toBe(false);
  });
});

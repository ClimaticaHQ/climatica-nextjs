// @vitest-environment jsdom
import { StepSlider } from "@/components/UI/StepSlider";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const STEPS = [
  { value: "smaller", label: "Smaller" },
  { value: "small", label: "Small" },
  { value: "default", label: "Default" },
  { value: "large", label: "Large" },
  { value: "larger", label: "Larger" },
] as const;
type TStepValue = (typeof STEPS)[number]["value"];

/** A slider holding its value, as a page would, reporting every change. */
function Harness({ onChange }: { onChange: (value: TStepValue) => void }) {
  const [value, setValue] = useState<TStepValue>("default");
  return (
    <StepSlider
      label="Text size"
      steps={STEPS}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

const slider = () => screen.getByRole("slider", { name: "Text size" });

beforeEach(() => {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("StepSlider", () => {
  it("draws a dot for every step", () => {
    const { container } = render(<Harness onChange={() => {}} />);
    expect(container.querySelectorAll("[data-step-dot]")).toHaveLength(STEPS.length);
  });

  it("announces the step's name, not its index", () => {
    render(<Harness onChange={() => {}} />);
    expect(slider().getAttribute("aria-valuetext")).toBe("Default");
    expect(slider().getAttribute("max")).toBe(String(STEPS.length - 1));
  });

  it("moves one step per arrow key, applying each at once", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.keyDown(slider(), { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("large");
    expect(slider().getAttribute("aria-valuetext")).toBe("Large");
    fireEvent.keyDown(slider(), { key: "ArrowLeft" });
    fireEvent.keyDown(slider(), { key: "ArrowDown" });
    expect(onChange).toHaveBeenLastCalledWith("small");
    fireEvent.keyDown(slider(), { key: "ArrowUp" });
    expect(onChange).toHaveBeenLastCalledWith("default");
  });

  it("goes to the first and last steps with Home and End, and stops there", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.keyDown(slider(), { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith("larger");
    fireEvent.keyDown(slider(), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(slider(), { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith("smaller");
    expect(slider().getAttribute("aria-valuetext")).toBe("Smaller");
  });

  it("moves only the slider while dragged, and applies on release", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.input(slider(), { target: { value: "4" } });
    expect(slider().getAttribute("aria-valuetext")).toBe("Larger");
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(slider(), { target: { value: "4" } });
    expect(onChange).toHaveBeenCalledWith("larger");
  });
});

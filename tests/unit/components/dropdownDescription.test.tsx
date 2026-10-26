// @vitest-environment jsdom
import { Dropdown } from "@/components/UI/Dropdown";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

describe("Dropdown: a disabled option's description", () => {
  it("shows it under the label and announces it as the option's description", () => {
    const onChange = vi.fn();
    render(
      <Dropdown
        options={[
          { value: "2.5m", label: "2.5 min" },
          {
            value: "30s",
            label: "30 sec",
            disabled: true,
            description: "Only for Climate 1970–2000",
          },
        ]}
        value="2.5m"
        onChange={onChange}
        optionTestIdPrefix="grid"
      />,
    );
    const option = screen.getByTestId("grid-30s");
    expect(option.hasAttribute("disabled")).toBe(true);
    const descriptionId = option.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(descriptionId)?.textContent).toBe("Only for Climate 1970–2000");
    fireEvent.click(option);
    expect(onChange).not.toHaveBeenCalled();
    // * an option without one has no description
    expect(screen.getByTestId("grid-2.5m").hasAttribute("aria-describedby")).toBe(false);
  });
});

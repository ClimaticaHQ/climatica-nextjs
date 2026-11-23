// @vitest-environment jsdom
import { SlidingIndicator } from "@/components/UI/SlidingIndicator";
import { ESlidingIndicatorAxis } from "@/enums";
import { useSlidingIndicator } from "@/hooks/ui/useSlidingIndicator";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const MOTION_CLASS = "test-slide";
const ITEMS = ["a", "b", "c"];

function List({ activeKey }: { activeKey: string | null }) {
  const { containerRef, indicator } = useSlidingIndicator<HTMLDivElement>({
    activeKey,
    activeSelector: '[aria-current="true"]',
  });
  return (
    <div ref={containerRef}>
      <SlidingIndicator
        indicator={indicator}
        axis={ESlidingIndicatorAxis.BOTH}
        className="pill"
        motionClass={MOTION_CLASS}
      />
      {ITEMS.map((key, index) => (
        <span
          key={key}
          aria-current={key === activeKey}
          ref={(node) => {
            if (node)
              node.getBoundingClientRect = () =>
                DOMRect.fromRect({ x: index * 50, y: 0, width: 40, height: 20 });
          }}
        />
      ))}
    </div>
  );
}

beforeEach(() => {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
afterEach(cleanup);

const pill = (container: HTMLElement) =>
  container.querySelector<HTMLElement>("[data-sliding-indicator]");

describe("useSlidingIndicator with SlidingIndicator", () => {
  it("is placed on the active item at once, without a transition", () => {
    const { container } = render(<List activeKey="b" />);
    expect(pill(container)?.style.transform).toBe("translate(50px, 0px)");
    expect(pill(container)?.className).not.toContain(MOTION_CLASS);
  });

  it("slides to a new active item once placed", () => {
    const { container, rerender } = render(<List activeKey="a" />);
    rerender(<List activeKey="c" />);
    expect(pill(container)?.style.transform).toBe("translate(100px, 0px)");
    expect(pill(container)?.style.width).toBe("40px");
    expect(pill(container)?.className).toContain(MOTION_CLASS);
  });

  it("draws nothing with no active item, and comes back in place", () => {
    const { container, rerender } = render(<List activeKey="a" />);
    rerender(<List activeKey={null} />);
    expect(pill(container)).toBeNull();
    rerender(<List activeKey="b" />);
    expect(pill(container)?.className).not.toContain(MOTION_CLASS);
  });
});

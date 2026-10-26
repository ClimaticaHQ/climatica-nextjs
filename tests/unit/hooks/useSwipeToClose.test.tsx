// @vitest-environment jsdom
import { useSwipeToClose } from "@/hooks/ui/useSwipeToClose";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const THRESHOLD = 80;

beforeAll(() => {
  // * jsdom doesn't implement pointer capture
  Element.prototype.setPointerCapture = vi.fn();
});

afterEach(cleanup);

function DragZone({ onClose }: { onClose: () => void }) {
  const { offset, isDragging, handlers } = useSwipeToClose({
    isEnabled: true,
    thresholdPx: THRESHOLD,
    onClose,
  });
  return (
    <div data-testid="zone" data-offset={offset} data-dragging={isDragging} {...handlers}>
      <button type="button">close</button>
    </div>
  );
}

function renderZone() {
  const onClose = vi.fn();
  render(<DragZone onClose={onClose} />);
  return { zone: screen.getByTestId("zone"), onClose };
}

describe("useSwipeToClose", () => {
  it("follows a downward drag and closes past the threshold", () => {
    const { zone, onClose } = renderZone();
    fireEvent.pointerDown(zone, { clientY: 100, pointerType: "touch" });
    fireEvent.pointerMove(zone, { clientY: 100 + THRESHOLD + 10 });
    expect(zone.dataset["offset"]).toBe(String(THRESHOLD + 10));
    fireEvent.pointerUp(zone);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("snaps back short of the threshold, and never moves up", () => {
    const { zone, onClose } = renderZone();
    fireEvent.pointerDown(zone, { clientY: 100, pointerType: "touch" });
    fireEvent.pointerMove(zone, { clientY: 40 });
    expect(zone.dataset["offset"]).toBe("0");
    fireEvent.pointerMove(zone, { clientY: 100 + THRESHOLD - 1 });
    fireEvent.pointerUp(zone);
    expect(onClose).not.toHaveBeenCalled();
    expect(zone.dataset["offset"]).toBe("0");
  });

  it("starts no drag from the zone's own buttons", () => {
    const { zone } = renderZone();
    fireEvent.pointerDown(screen.getByRole("button"), { clientY: 100, pointerType: "touch" });
    fireEvent.pointerMove(zone, { clientY: 300 });
    expect(zone.dataset["dragging"]).toBe("false");
    expect(zone.dataset["offset"]).toBe("0");
  });
});

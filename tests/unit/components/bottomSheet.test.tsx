// @vitest-environment jsdom
import { BottomSheet } from "@/components/UI/BottomSheet";
import messages from "@/i18n/locales/en.json";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const TITLE = "Sheet title";

beforeAll(() => {
  // * jsdom has no matchMedia; motion preference reads it
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(cleanup);

/** A trigger that opens the sheet; the sheet closes through onClose, like a real owner. */
function Harness({ onClose }: { onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => {
    onClose?.();
    setIsOpen(false);
  };
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <button type="button" onClick={() => setIsOpen(true)}>
        open
      </button>
      <BottomSheet
        isOpen={isOpen}
        onClose={close}
        title={TITLE}
        footer={<button type="button">apply</button>}
      >
        <input aria-label="first field" />
      </BottomSheet>
    </NextIntlClientProvider>
  );
}

function openSheet(onClose?: () => void) {
  render(<Harness {...(onClose ? { onClose } : {})} />);
  const trigger = screen.getByRole("button", { name: "open" });
  trigger.focus();
  fireEvent.click(trigger);
  return { trigger, dialog: screen.getByRole("dialog") };
}

describe("BottomSheet", () => {
  it("renders a labelled modal dialog into <body>", () => {
    const { dialog } = openSheet();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(screen.getByRole("dialog", { name: TITLE })).toBe(dialog);
    expect(dialog.closest("body")).toBe(document.body);
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    const { dialog } = openSheet(onClose);
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a backdrop tap", () => {
    const onClose = vi.fn();
    openSheet(onClose);
    fireEvent.click(screen.getByTestId("bottom-sheet-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("moves focus into the sheet on open and back to the trigger on close", () => {
    const { trigger, dialog } = openSheet();
    expect(document.activeElement).toBe(dialog);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(document.activeElement).toBe(trigger);
  });

  it("keeps Tab inside the sheet, wrapping at both ends", () => {
    const { dialog } = openSheet();
    const closeButton = screen.getByRole("button", { name: "Close" });
    const last = screen.getByRole("button", { name: "apply" });

    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(closeButton);

    closeButton.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);

    // * from the dialog itself (where focus lands on open), Shift+Tab wraps to the end too
    dialog.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("locks the body scroll while open and restores it on close", () => {
    document.body.style.overflow = "auto";
    openSheet();
    expect(document.body.style.overflow).toBe("hidden");
    act(() => fireEvent.click(screen.getByRole("button", { name: "Close" })));
    expect(document.body.style.overflow).toBe("auto");
  });

  it("ignores close requests while it's already closing", () => {
    const onClose = vi.fn();
    const { dialog } = openSheet(onClose);
    fireEvent.keyDown(dialog, { key: "Escape" });
    // * still on screen, sliding out
    const leaving = screen.queryByRole("dialog");
    if (leaving !== null) fireEvent.keyDown(leaving, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

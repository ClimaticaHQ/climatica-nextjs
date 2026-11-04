// @vitest-environment jsdom
import { COPY_FEEDBACK_MS } from "@/constants";
import { ECopyStatus } from "@/enums";
import { useCopyToClipboard } from "@/hooks/ui";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  vi.useFakeTimers();
  writeText.mockReset();
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
});
afterEach(() => vi.useRealTimers());

describe("useCopyToClipboard", () => {
  it("copies the text, reports it, then goes back to idle", async () => {
    writeText.mockResolvedValue();
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.status).toBe(ECopyStatus.IDLE);

    await act(() => result.current.copy("Kononenko et al."));
    expect(writeText).toHaveBeenCalledWith("Kononenko et al.");
    expect(result.current.status).toBe(ECopyStatus.COPIED);

    act(() => vi.advanceTimersByTime(COPY_FEEDBACK_MS));
    expect(result.current.status).toBe(ECopyStatus.IDLE);
  });

  it("reports a refused copy instead of throwing", async () => {
    writeText.mockRejectedValue(new Error("not allowed"));
    const { result } = renderHook(() => useCopyToClipboard());
    await act(() => result.current.copy("text"));
    expect(result.current.status).toBe(ECopyStatus.FAILED);
  });

  it("restarts the feedback on a second copy", async () => {
    writeText.mockResolvedValue();
    const { result } = renderHook(() => useCopyToClipboard());
    await act(() => result.current.copy("a"));
    act(() => vi.advanceTimersByTime(COPY_FEEDBACK_MS - 1));
    await act(() => result.current.copy("b"));
    act(() => vi.advanceTimersByTime(COPY_FEEDBACK_MS - 1));
    expect(result.current.status).toBe(ECopyStatus.COPIED);
  });
});

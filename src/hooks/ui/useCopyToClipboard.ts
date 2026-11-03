"use client";

import { COPY_FEEDBACK_MS } from "@/constants";
import { ECopyStatus } from "@/enums";
import { useEffect, useRef, useState } from "react";

/** Copies text to the clipboard and reports it for COPY_FEEDBACK_MS, then goes back to idle. */
export function useCopyToClipboard() {
  const [status, setStatus] = useState(ECopyStatus.IDLE);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy(text: string) {
    if (timer.current) clearTimeout(timer.current);
    // * the Clipboard API rejects without permission or a secure context: say so, don't throw
    const next = await navigator.clipboard.writeText(text).then(
      () => ECopyStatus.COPIED,
      () => ECopyStatus.FAILED,
    );
    setStatus(next);
    timer.current = setTimeout(() => setStatus(ECopyStatus.IDLE), COPY_FEEDBACK_MS);
  }

  return { status, copy };
}

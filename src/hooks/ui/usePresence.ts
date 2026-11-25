"use client";

import { useEffect, useState } from "react";

export function usePresence(isOpen: boolean, exitMs: number) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    setIsLeaving(!isOpen && exitMs > 0);
  }

  useEffect(() => {
    if (!isLeaving) return;
    const timer = window.setTimeout(() => setIsLeaving(false), exitMs);
    return () => window.clearTimeout(timer);
  }, [isLeaving, exitMs]);

  return { isPresent: isOpen || isLeaving, isLeaving };
}

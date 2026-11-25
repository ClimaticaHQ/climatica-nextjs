import { createDelayedFlag } from "@/utils";
import { useEffect, useRef, useState } from "react";

export function useDelayedFlag(isActive: boolean, delayMs: number) {
  const [isOn, setIsOn] = useState(false);
  const flagRef = useRef<ReturnType<typeof createDelayedFlag> | null>(null);

  useEffect(() => {
    flagRef.current ??= createDelayedFlag({ delayMs, onChange: setIsOn });
    flagRef.current.set(isActive);
  }, [isActive, delayMs]);

  useEffect(() => () => flagRef.current?.dispose(), []);

  return isOn;
}

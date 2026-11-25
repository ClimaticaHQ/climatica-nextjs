import type { TDelayedFlagArgs } from "@/types";

export function createDelayedFlag({ delayMs, onChange }: TDelayedFlagArgs) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let isOn = false;

  const clear = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  return {
    set(isActive: boolean) {
      if (isActive) {
        if (isOn || timer !== null) return;
        timer = setTimeout(() => {
          timer = null;
          isOn = true;
          onChange(true);
        }, delayMs);
        return;
      }
      clear();
      if (!isOn) return;
      isOn = false;
      onChange(false);
    },
    dispose: clear,
  };
}

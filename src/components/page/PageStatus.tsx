import { StatusMessage } from "@/components/UI";
import { EDataStatus, EStatusMessageVariant } from "@/enums";
import { useErrorMessage } from "@/hooks/pages/useErrorMessage";
import type { TPageStatusProps } from "./page.type";

/** The results' empty or error message; nothing while loading or ready. */
export function PageStatus({ state }: TPageStatusProps) {
  const errorMessage = useErrorMessage();

  if (state.status === EDataStatus.EMPTY && state.message !== null) {
    return (
      <StatusMessage
        variant={EStatusMessageVariant.EMPTY}
        message={state.message}
        suppressHydrationWarning
      />
    );
  }
  if (state.status === EDataStatus.ERROR) {
    return (
      <StatusMessage variant={EStatusMessageVariant.ERROR} message={errorMessage(state.error)} />
    );
  }
  return null;
}

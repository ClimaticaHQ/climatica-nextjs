import { StatusMessage } from "@/components/UI";
import { EDataStatus, EStatusMessageVariant } from "@/enums";
import { useErrorMessage } from "@/hooks/pages/useErrorMessage";
import { PAGE_LAYOUT_CLASSES as C } from "./page.constant";
import type { TPageStatusProps } from "./page.type";

/** The results' empty or error message; nothing while loading or ready. */
export function PageStatus({ state }: TPageStatusProps) {
  const errorMessage = useErrorMessage();

  if (state.status === EDataStatus.EMPTY && state.messages.length > 0) {
    const messages = state.messages.map((message) => (
      <StatusMessage
        key={message}
        variant={EStatusMessageVariant.EMPTY}
        message={message}
        suppressHydrationWarning
      />
    ));
    return messages.length === 1 ? messages : <div className={C.STATUS_LIST}>{messages}</div>;
  }
  if (state.status === EDataStatus.ERROR) {
    return (
      <StatusMessage variant={EStatusMessageVariant.ERROR} message={errorMessage(state.error)} />
    );
  }
  return null;
}

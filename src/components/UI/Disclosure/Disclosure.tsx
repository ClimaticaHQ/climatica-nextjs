import { ChevronDownIcon } from "@/components/svg";
import { DISCLOSURE_CLASSES as C } from "./Disclosure.constant";
import type { TDisclosureProps } from "./Disclosure.type";

/**
 * A question and its answer, closed by default. Native details / summary: keyboard, screen
 * readers and find-in-page (which opens it) work without script.
 */
export function Disclosure({ summary, id, children }: TDisclosureProps) {
  return (
    <details id={id} className={C.ROOT}>
      <summary className={C.SUMMARY}>
        {summary}
        <span className={C.CHEVRON}>
          <ChevronDownIcon open={false} />
        </span>
      </summary>
      <div className={C.CONTENT}>{children}</div>
    </details>
  );
}

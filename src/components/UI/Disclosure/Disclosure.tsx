import { ChevronDownIcon } from "@/components/svg";
import { EDisclosureSize } from "@/enums";
import { DISCLOSURE_CLASSES as C } from "./Disclosure.constant";
import type { TDisclosureProps } from "./Disclosure.type";

/**
 * A question and its answer, closed by default. Native details / summary: keyboard, screen
 * readers and find-in-page (which opens it) work without script.
 */
export function Disclosure({ summary, id, size = EDisclosureSize.MD, children }: TDisclosureProps) {
  return (
    <details id={id} className={C.ROOT}>
      <summary className={`${C.SUMMARY} ${C.SIZE[size].SUMMARY}`} data-disclosure-size={size}>
        {summary}
        <span className={`${C.CHEVRON} ${C.SIZE[size].CHEVRON}`}>
          <ChevronDownIcon open={false} />
        </span>
      </summary>
      <div className={C.CONTENT}>{children}</div>
    </details>
  );
}

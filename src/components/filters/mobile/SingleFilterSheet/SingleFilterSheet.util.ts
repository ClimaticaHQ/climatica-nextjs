import { FILTERS_CONFIG } from "@/constants";
import { EFilterChoice, type EFilterKey } from "@/enums";

/** One-option filters apply as soon as an option is picked; lists and typed values need Apply. */
export function isAppliedOnSelect(key: EFilterKey) {
  return FILTERS_CONFIG[key].choice === EFilterChoice.SINGLE;
}

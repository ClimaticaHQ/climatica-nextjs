"use client";

import { FILTER_ORDER } from "@/constants";
import { EFilterAvailability } from "@/enums";
import { getFilterAvailability } from "@/utils/filters.util";
import { FILTER_SECTION_COMPONENTS } from "./filters.constant";
import type { TFilterSectionsProps } from "./filters.type";

/**
 * Every filter section the context shows, in FILTER_ORDER — controlled: values in, changes
 * out. Where they're rendered, and when changes apply, is the caller's.
 */
export function FilterSections(props: TFilterSectionsProps) {
  return (props.keys ?? FILTER_ORDER).map((key) => {
    const availability = getFilterAvailability(key, props.context);
    const Section = FILTER_SECTION_COMPONENTS[key];
    if (availability === EFilterAvailability.HIDDEN || Section === null) return null;
    return <Section key={key} {...props} availability={availability} />;
  });
}

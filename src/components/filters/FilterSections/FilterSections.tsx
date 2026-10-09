"use client";

import { FILTER_ORDER } from "@/constants";
import { EFilterAvailability } from "@/enums";
import { getFilterAvailability } from "@/utils/filters.util";
import { Fragment } from "react";
import { FILTER_SECTION_RENDERERS } from "./FilterSections.constant";
import type { TFilterSectionsProps } from "./FilterSections.type";

/**
 * Every filter section the context shows, in FILTER_ORDER — controlled: values in, changes
 * out. Where they're rendered, and when changes apply, is the caller's.
 */
export function FilterSections(props: TFilterSectionsProps) {
  return (props.keys ?? FILTER_ORDER).map((key) => {
    const availability = getFilterAvailability(key, props.context);
    if (availability === EFilterAvailability.HIDDEN) return null;
    return (
      <Fragment key={key}>{FILTER_SECTION_RENDERERS[key]({ ...props, availability })}</Fragment>
    );
  });
}

"use client";

import { SectionLabel } from "@/components/UI/SectionLabel";
import { EFilterAvailability } from "@/enums";
import { getFilterUnavailableLayout } from "@/utils/filters.util";
import { useContext } from "react";
import { FilterUnavailableNote } from "../FilterUnavailableNote";
import { FILTER_SECTION_DIMMED_CLASS, FilterSectionTitleContext } from "./FilterSection.constant";
import type { TFilterSectionProps } from "./FilterSection.type";

/** One filter's block: its label, its controls, and why it's disabled when it is. */
export function FilterSection({
  title,
  availability = EFilterAvailability.AVAILABLE,
  className,
  children,
}: TFilterSectionProps) {
  const isTitleShown = useContext(FilterSectionTitleContext);
  const layout = getFilterUnavailableLayout(availability);
  const isDimmed = layout?.isDimmed ?? false;
  const note = <FilterUnavailableNote availability={availability} />;
  const classes = [className, isDimmed ? FILTER_SECTION_DIMMED_CLASS : ""].filter(Boolean);

  return (
    <div className={classes.join(" ")} inert={isDimmed}>
      {isTitleShown && title !== undefined && <SectionLabel text={title} />}
      {layout?.isNoteFirst && note}
      {children}
      {layout !== null && !layout.isNoteFirst && note}
    </div>
  );
}

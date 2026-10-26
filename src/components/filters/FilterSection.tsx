"use client";

import { SectionLabel } from "@/components/UI/SectionLabel";
import { FILTER_UNAVAILABLE_NOTE_KEYS, FOCUS_RING_CLASS } from "@/constants";
import { EFilterAvailability } from "@/enums";
import { getFilterUnavailableLayout, isFilterUnavailableReason } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import {
  FILTER_NOTE_CLASSES,
  FILTER_SECTION_DIMMED_CLASS,
  FILTER_UNAVAILABLE_ACTION_CLASS,
  FILTER_UNAVAILABLE_ACTION_LABELS,
} from "./filters.constant";
import { FilterSectionTitleContext, FilterUnavailableActionsContext } from "./filters.context";
import type { TFilterNoteProps, TFilterSectionProps, TUnavailableNoteProps } from "./filters.type";

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
  const note = <UnavailableNote availability={availability} />;
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

/** A short note under a filter — an explanation, a muted aside or an error — and a way out. */
export function FilterNote({ text, variant, className, id, action }: TFilterNoteProps) {
  return (
    <>
      <p id={id} className={`${FILTER_NOTE_CLASSES[variant]}${className ? ` ${className}` : ""}`}>
        {text}
      </p>
      {action !== undefined && (
        <button
          type="button"
          onClick={action.onClick}
          className={`${FOCUS_RING_CLASS} ${FILTER_UNAVAILABLE_ACTION_CLASS}`}
        >
          {action.label}
        </button>
      )}
    </>
  );
}

function UnavailableNote({ availability }: TUnavailableNoteProps) {
  const t = useTranslations();
  const actions = useContext(FilterUnavailableActionsContext);
  const layout = getFilterUnavailableLayout(availability);
  const textKey = FILTER_UNAVAILABLE_NOTE_KEYS[availability];
  if (layout === null || textKey === undefined || !isFilterUnavailableReason(availability)) {
    return null;
  }
  const onAction = actions[availability];
  const actionLabel = FILTER_UNAVAILABLE_ACTION_LABELS[availability];

  return (
    <div className={layout.noteClassName}>
      <FilterNote
        text={t(textKey)}
        variant={layout.noteVariant}
        {...(onAction !== undefined && actionLabel !== undefined
          ? { action: { label: actionLabel(t), onClick: onAction } }
          : {})}
      />
    </div>
  );
}

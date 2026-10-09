"use client";

import { FILTER_UNAVAILABLE_NOTE_KEYS, FOCUS_RING_CLASS } from "@/constants";
import { getFilterUnavailableLayout, isFilterUnavailableReason } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { FilterHint } from "../FilterHint";
import {
  FILTER_UNAVAILABLE_ACTION_CLASS,
  FILTER_UNAVAILABLE_ACTION_LABELS,
  FilterUnavailableActionsContext,
} from "./FilterUnavailableNote.constant";
import type { TFilterUnavailableNoteProps } from "./FilterUnavailableNote.type";

/** Why a filter is disabled here — and, where there is one, the way out; nothing when available. */
export function FilterUnavailableNote({ availability }: TFilterUnavailableNoteProps) {
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
      <FilterHint text={t(textKey)} variant={layout.noteVariant} />
      {onAction !== undefined && actionLabel !== undefined && (
        <button
          type="button"
          onClick={onAction}
          className={`${FOCUS_RING_CLASS} ${FILTER_UNAVAILABLE_ACTION_CLASS}`}
        >
          {actionLabel(t)}
        </button>
      )}
    </div>
  );
}

import { CheckIcon } from "@/components/svg";
import { getRadioGroupIndex } from "@/utils";
import { useTranslations } from "next-intl";
import { useId, useRef, type KeyboardEvent } from "react";
import { BAR_STYLE_OPTIONS, BAR_STYLE_PICKER_CLASSES as C } from "../Settings.constant";
import type { TBarStylePickerProps } from "../Settings.type";
import { BarStylePreview } from "./BarStylePreview";

/**
 * The bar style as appearance cards — a thumbnail of the chart in that style, its name under it.
 * One radio group: the arrows move the selection (and the focus), the whole card is clickable.
 */
export function BarStylePicker({ labelId, value, onChange }: TBarStylePickerProps) {
  const t = useTranslations();
  const descriptionId = useId();
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = BAR_STYLE_OPTIONS.findIndex((option) => option.value === value);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const next = getRadioGroupIndex({
      key: event.key,
      index: selectedIndex,
      count: BAR_STYLE_OPTIONS.length,
    });
    const option = next === null ? undefined : BAR_STYLE_OPTIONS[next];
    if (next === null || !option) return;
    event.preventDefault();
    onChange(option.value);
    cards.current[next]?.focus();
  }

  return (
    <div role="radiogroup" aria-labelledby={labelId} className={C.GROUP} onKeyDown={handleKeyDown}>
      {BAR_STYLE_OPTIONS.map((option, index) => {
        const isSelected = option.value === value;
        const description = t(option.descriptionKey);
        return (
          <button
            key={option.value}
            ref={(card) => {
              cards.current[index] = card;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-describedby={`${descriptionId}-${option.value}`}
            // * roving focus: Tab reaches the group once, on its selected card
            tabIndex={isSelected ? 0 : -1}
            title={description}
            data-bar-style={option.value}
            className={C.CARD}
            onClick={() => onChange(option.value)}
          >
            <span className={`${C.THUMB} ${isSelected ? C.THUMB_SELECTED : ""}`}>
              <BarStylePreview barStyle={option.value} />
            </span>
            <span className={isSelected ? C.NAME_SELECTED : C.NAME}>{t(option.labelKey)}</span>
            <span
              aria-hidden
              data-selection-indicator
              className={isSelected ? C.INDICATOR_SELECTED : C.INDICATOR}
            >
              {isSelected && <CheckIcon />}
            </span>
            <span id={`${descriptionId}-${option.value}`} hidden>
              {description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { FIGURE_PLACE } from "@/constants";
import { useIsNearViewport } from "@/hooks/ui";
import { useTranslations } from "next-intl";
import { INFO_FIGURE, INFO_FIGURE_CLASSES as C } from "../info.constant";
import type { TInfoFigureMarkerProps, TInfoFigureProps } from "../info.type";

/**
 * An Info page figure: a picture with numbered annotations, and a caption saying where its data
 * come from and, by the same numbers, what each marks. The picture is hidden from screen
 * readers (the caption carries it) and mounts only near the viewport.
 */
export function InfoFigure({ visual, annotations, noteKey }: TInfoFigureProps) {
  const t = useTranslations();
  const { ref, isNear } = useIsNearViewport<HTMLDivElement>(INFO_FIGURE.NEAR_MARGIN);
  const source = t("info.figures.source", {
    place: FIGURE_PLACE.NAME,
    period: FIGURE_PLACE.PERIOD,
    grid: t(`cellSizesShort.${FIGURE_PLACE.GRID_KEY}`),
  });

  return (
    <figure className={C.ROOT}>
      <div ref={ref} aria-hidden="true" className={`${C.VISUAL} ${isNear ? "" : C.PLACEHOLDER}`}>
        {isNear && visual}
      </div>
      <figcaption className={C.CAPTION}>
        <p>{source}</p>
        <ol className={C.ITEMS}>
          {annotations.map(({ key, captionKey }, index) => (
            <li key={key} className={C.ITEM} data-figure-item={index + 1}>
              <InfoFigureMarker number={index + 1} />
              <span>{t(captionKey)}</span>
            </li>
          ))}
        </ol>
        {noteKey !== undefined && <p>{t(noteKey)}</p>}
      </figcaption>
    </figure>
  );
}

/** An annotation's number in HTML — a caption line's, and a stats item's on the chart. */
export function InfoFigureMarker({ number }: TInfoFigureMarkerProps) {
  return (
    <span className={C.MARKER} data-figure-marker={number}>
      {number}
    </span>
  );
}

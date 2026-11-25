"use client";

import { useTranslations } from "next-intl";
import { INFO_FIGURE_CLASSES as C } from "../info.constant";
import type { TInfoFigureMarkerProps, TInfoFigureProps } from "../info.type";

export function InfoFigure({ visual, annotations, place }: TInfoFigureProps) {
  const t = useTranslations();
  const source = t("info.figures.source", {
    place: place.NAME,
    period: place.PERIOD,
    grid: t(`cellSizesShort.${place.GRID_KEY}`),
  });

  return (
    <figure className={C.ROOT}>
      <div className={C.VISUAL}>{visual}</div>
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
      </figcaption>
    </figure>
  );
}

export function InfoFigureMarker({ number }: TInfoFigureMarkerProps) {
  return (
    <span className={C.MARKER} data-figure-marker={number}>
      {number}
    </span>
  );
}

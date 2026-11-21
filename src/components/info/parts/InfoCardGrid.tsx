"use client";

import { Card } from "@/components/Card";
import { ExternalLink } from "@/components/UI/ExternalLink";
import { ECardBackground, ECardSize, EInfoCardLayout } from "@/enums";
import Link from "next/link";
import {
  INFO_CLASSES as C,
  INFO_CARD_CLASSES as CARD,
  INFO_CARD_GRID_COLUMNS,
} from "../info.constant";
import type { TInfoCardGridProps, TInfoCardProps } from "../info.type";

/** The Info pages' cards: a grid of one Card per item, filled from the item's slots. */
export function InfoCardGrid({
  items,
  columns,
  isOrdered = false,
  layout = EInfoCardLayout.STACK,
}: TInfoCardGridProps) {
  const List = isOrdered ? "ol" : "ul";
  return (
    <List className={INFO_CARD_GRID_COLUMNS[columns]}>
      {items.map((item) => (
        <li key={item.key}>
          <InfoCard item={item} layout={layout} />
        </li>
      ))}
    </List>
  );
}

function InfoCard({ item, layout }: TInfoCardProps) {
  const { icon: Icon, number, eyebrow, title, titleHref, formula, text, body, note, link } = item;
  const heading = (
    <h3 className={C.SUBHEADING}>
      {titleHref === undefined ? (
        title
      ) : (
        <Link href={titleHref} className={C.LINK}>
          {title}
        </Link>
      )}
    </h3>
  );
  const background = item.isHighlighted ? ECardBackground.HIGHLIGHT : ECardBackground.DEFAULT;

  // * a numbered step: its badge beside the title and text
  if (layout === EInfoCardLayout.ROW) {
    return (
      <Card size={ECardSize.MD} background={background} className={CARD.ROW}>
        {number !== undefined && (
          <span className={C.NUMBER} aria-hidden="true">
            {number}
          </span>
        )}
        <span className={CARD.ROW_TEXT}>
          {heading}
          {text !== undefined && <span className={C.SMALL}>{text}</span>}
        </span>
      </Card>
    );
  }

  return (
    <Card size={ECardSize.MD} background={background} className={CARD.STACK}>
      {Icon !== undefined && (
        <span className={C.ICON}>
          <Icon />
        </span>
      )}
      {eyebrow !== undefined && <span className={C.STEP_LABEL}>{eyebrow}</span>}
      {formula === undefined ? (
        heading
      ) : (
        <div className={CARD.TITLE_ROW}>
          {heading}
          <code className={C.FORMULA}>{formula}</code>
        </div>
      )}
      {text !== undefined && <p className={C.SMALL}>{text}</p>}
      {body}
      {note !== undefined && <p className={`${C.SMALL} ${CARD.NOTE_ITALIC}`}>{note}</p>}
      {link !== undefined && (
        <ExternalLink href={link.href} className={`${C.CARD_LINK} ${CARD.LINK}`}>
          {link.label}
        </ExternalLink>
      )}
    </Card>
  );
}

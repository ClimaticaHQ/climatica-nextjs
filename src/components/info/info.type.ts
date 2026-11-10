import type {
  TAnnotationLayout,
  TChartProjection,
  TFigureAnnotation,
  TInfoPage,
  TInfoSection,
} from "@/types";
import type { EInfoCardLayout } from "@/enums";
import type { ComponentType, MouseEvent, ReactNode } from "react";

export type TInfoSectionProps = {
  /** one of INFO_SECTION_IDS */
  id: string;
  /** a paragraph under the title */
  intro?: ReactNode;
  children?: ReactNode;
};

export type TIconStep = {
  key: string;
  Icon: ComponentType;
};

export type TDataSource = {
  key: string;
  name: string;
  url: string;
  /** its citation or licence, as its authors give it: not translated */
  note: string;
};

export type TReference = {
  key: string;
  text: string;
  url?: string;
};

export type THowToCiteProps = {
  citation: string;
  bibtex: string;
};

export type TInfoNavTreeProps = {
  pages: readonly TInfoPage[];
  currentRoute: string | null;
  /** the current page's sections, nested under it */
  sections: readonly TInfoSection[];
  activeId: string | null;
  getPageHref: (route: string) => string;
  onSectionClick: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
  /** absent: a plain link */
  onPageClick?: ((event: MouseEvent<HTMLAnchorElement>, href: string) => void) | undefined;
  /** finger-sized rows (the Contents sheet): 48 px pages, 44 px sections */
  hasLargeTargets: boolean;
};

export type TInfoContentsBarProps = {
  pageLabel: string;
  sectionLabel: string | null;
  isOpen: boolean;
  onOpen: () => void;
};

export type TInfoLayoutProps = {
  children: ReactNode;
  /** under the content of every Info page (rendered on the server) */
  footer: ReactNode;
};

/** One card of an InfoCardGrid. Every slot is optional but the title; they show in this order. */
export type TInfoCardItem = {
  key: string;
  /** a STACK card's icon, in a tinted square */
  icon?: ComponentType;
  /** a ROW card's number, in a badge */
  number?: string;
  /** a small uppercase line above the title */
  eyebrow?: string;
  title: string;
  /** a link on the title: a page of the app */
  titleHref?: string;
  /** beside the title, in code type */
  formula?: string;
  text?: ReactNode;
  /** content that doesn't fit the text slot (a list, several paragraphs), as given */
  body?: ReactNode;
  /** a citation or licence, in italics */
  note?: string;
  /** another site, at the bottom of the card */
  link?: { href: string; label: string };
  isHighlighted?: boolean;
};

export type TInfoCardColumns = 1 | 2 | 3;

export type TInfoCardGridProps = {
  items: readonly TInfoCardItem[];
  /** from lg; one column below */
  columns: TInfoCardColumns;
  /** an <ol>: the cards are steps */
  isOrdered?: boolean;
  layout?: EInfoCardLayout;
};

export type TInfoCardProps = {
  item: TInfoCardItem;
  layout: EInfoCardLayout;
};

/** One entry of an InfoList: its text, and optionally an icon before it or a link after it. */
export type TInfoListItem = {
  key: string;
  text: ReactNode;
  icon?: ComponentType;
  link?: { href: string; label: string };
};

export type TInfoListProps = {
  items: readonly TInfoListItem[];
  isNumbered?: boolean;
};

export type TInfoFigureProps = {
  /** the picture, hidden from screen readers: the caption says everything it shows */
  visual: ReactNode;
  /** the numbered annotations: the n-th's marker and caption line both read n */
  annotations: readonly Pick<TFigureAnnotation, "key" | "captionKey">[];
  /** a last, unnumbered caption line */
  noteKey?: string;
};

export type TInfoFigureMarkerProps = {
  number: number;
};

export type TFigureAnnotationsProps = {
  annotations: readonly TFigureAnnotation[];
  projection: TChartProjection;
  /** at the text scale (scaleAnnotationLayout) */
  layout: TAnnotationLayout;
};

export type TAnnotationNumberProps = {
  number: number;
  x: number;
  y: number;
  layout: TAnnotationLayout;
};

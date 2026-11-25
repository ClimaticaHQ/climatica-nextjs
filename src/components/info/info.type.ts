import type {
  TAnnotationLayout,
  TChartProjection,
  TFigureAnnotation,
  TFigurePlace,
  TInfoPage,
  TInfoSection,
} from "@/types";
import type { EInfoCardLayout } from "@/enums";
import type { useInfoNavigation } from "@/hooks/pages/useInfoNavigation";
import type { ComponentType, MouseEvent, ReactNode } from "react";

export type TInfoSectionProps = {
  id: string;
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
  note: string;
};

export type TReference = {
  key: string;
  text: string;
  url?: string;
  title?: string;
};

export type THowToCiteProps = {
  citation: string;
  bibtex: string;
};

export type TInfoNavTreeProps = {
  pages: readonly TInfoPage[];
  currentRoute: string | null;
  openRoute: string | null;
  activeId: string | null;
  getPageHref: (route: string) => string;
  onSectionClick: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
  onPageClick: (event: MouseEvent<HTMLAnchorElement>, route: string) => void;
  hasLargeTargets: boolean;
};

export type TInfoSectionListProps = Pick<TInfoNavTreeProps, "activeId" | "onSectionClick"> & {
  sections: readonly TInfoSection[];
  linkSizeClass: string;
};

export type TInfoContentsBarProps = {
  pageLabel: string;
  sectionLabel: string | null;
  isOpen: boolean;
  onOpen: () => void;
};

export type TInfoNavigation = ReturnType<typeof useInfoNavigation>;

export type TInfoNavigationProviderProps = {
  children: ReactNode;
};

export type TInfoLayoutProps = {
  children: ReactNode;
};

export type TInfoCardItem = {
  key: string;
  icon?: ComponentType;
  number?: string;
  eyebrow?: string;
  title: string;
  titleHref?: string;
  formula?: string;
  text?: ReactNode;
  body?: ReactNode;
  note?: string;
  link?: { href: string; label: string };
  isHighlighted?: boolean;
};

export type TInfoCardColumns = 1 | 2 | 3;

export type TInfoCardGridProps = {
  items: readonly TInfoCardItem[];
  columns: TInfoCardColumns;
  isOrdered?: boolean;
  layout?: EInfoCardLayout;
};

export type TInfoCardProps = {
  item: TInfoCardItem;
  layout: EInfoCardLayout;
};

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
  visual: ReactNode;
  annotations: readonly Pick<TFigureAnnotation, "key" | "captionKey">[];
  place: TFigurePlace;
};

export type TFigureChartLoadingProps = {
  children: ReactNode;
};

export type TInfoFigureMarkerProps = {
  number: number;
};

export type TFigureAnnotationsProps = {
  annotations: readonly TFigureAnnotation[];
  projection: TChartProjection;
  layout: TAnnotationLayout;
};

export type TAnnotationNumberProps = {
  number: number;
  x: number;
  y: number;
  layout: TAnnotationLayout;
};

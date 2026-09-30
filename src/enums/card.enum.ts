// * a card's corner radius, by nesting level: page-level cards, small cards, cards inside a card
export enum ECardSize {
  LG = "lg",
  MD = "md",
  SM = "sm",
}

export enum ECardPadding {
  // * the content runs to the border (tables, bars, the map)
  NONE = "none",
  // * a split panel: 10 px on phones, 16 px from `sm`
  PANEL = "panel",
  // * a small stat card
  COMPACT = "compact",
  DEFAULT = "default",
}

export enum ECardElevation {
  FLAT = "flat",
  RAISED = "raised",
}

// * a stat card's value: XL for a short number, LG for text that may wrap (a city name)
export enum EStatValueSize {
  LG = "lg",
  XL = "xl",
}

export enum ECardBackground {
  DEFAULT = "default",
  // * a placeholder surface (the map skeleton)
  MUTED = "muted",
}

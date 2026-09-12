export type ExportMenuProps = {
  onExportCSV: () => void;
  onExportPNG: () => Promise<void>;
  onExportSVG?: () => void;
  onExportRawCsv?: () => Promise<void>;
  onExportRawJson?: () => Promise<void>;
  /** Whether the current dataset/period supports the raw export — only meaningful
   * when onExportRawCsv/onExportRawJson are provided at all. When false, those two
   * entries still render (so the feature is discoverable) but are disabled. */
  isRawDataAvailable?: boolean;
  isDisabled?: boolean;
};

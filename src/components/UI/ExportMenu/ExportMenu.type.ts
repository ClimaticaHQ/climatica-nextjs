export type ExportMenuProps = {
  onExportCSV: () => void;
  onExportPNG: () => Promise<void>;
  onExportSVG?: () => void | Promise<void>;
  onExportRawCsv?: () => Promise<void>;
  onExportRawJson?: () => Promise<void>;
  isRawDataAvailable?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
};

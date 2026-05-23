export type ExportMenuProps = {
  onExportCSV: () => void;
  onExportPNG: () => Promise<void>;
  onExportSVG?: () => void;
  isDisabled?: boolean;
};

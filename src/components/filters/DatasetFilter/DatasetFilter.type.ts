import type { TDataset } from "@/types";

export type TDatasetFilterProps = {
  value: TDataset;
  onChange: (dataset: TDataset) => void;
};

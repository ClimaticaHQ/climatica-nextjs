export type TInfoSection = {
  id: string;
  labelKey: string;
  isShown: boolean;
};

export type TInfoPage = {
  route: string;
  labelKey: string;
  sections: readonly TInfoSection[];
};

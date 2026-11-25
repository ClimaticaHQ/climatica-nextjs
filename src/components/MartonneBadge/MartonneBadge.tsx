import { Badge } from "@/components/UI/Badge";
import { EBadgeSize } from "@/enums";
import { useTranslations } from "next-intl";
import type { TMartonneBadgeProps } from "./MartonneBadge.type";

export function MartonneBadge({ badge }: TMartonneBadgeProps) {
  const t = useTranslations();
  const label = t(badge.labelKey);

  return (
    <Badge tone={badge.tone} size={EBadgeSize.SM} isTruncated title={label}>
      {label}
    </Badge>
  );
}

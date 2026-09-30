import { useTranslations } from "next-intl";
import type { TMartonneBadgeProps } from "./MartonneBadge.type";

export function MartonneBadge({ badge }: TMartonneBadgeProps) {
  const t = useTranslations();
  const label = t(badge.labelKey);

  // * one line, cut with an ellipsis in a narrow cell — the full class shows on hover
  return (
    <span
      className="min-w-0 max-w-full truncate rounded px-1.5 py-0.5 text-[10px] leading-none font-medium"
      style={{ backgroundColor: badge.bg, color: badge.color }}
      title={label}
    >
      {label}
    </span>
  );
}

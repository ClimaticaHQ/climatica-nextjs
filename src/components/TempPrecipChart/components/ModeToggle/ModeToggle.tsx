import { useTranslations } from "next-intl";
import { IconAreaChart } from "../../icons/IconAreaChart";
import { IconBarChart } from "../../icons/IconBarChart";
import type { TModeButtonProps, TModeToggleProps } from "../../TempPrecipChart.type";

function ModeButton({ isActive, onClick, title, children }: TModeButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors"
      style={{
        backgroundColor: isActive ? "var(--color-primary)" : "transparent",
        borderColor: isActive ? "var(--color-primary)" : "var(--color-border)",
        color: isActive ? "var(--color-on-primary)" : "var(--color-text-secondary)",
      }}
    >
      {children}
    </button>
  );
}

export function ModeToggle({ mode, onChange }: TModeToggleProps) {
  const t = useTranslations();
  return (
    <div className="flex gap-1.5">
      <ModeButton
        isActive={mode === "standard"}
        onClick={() => onChange("standard")}
        title={t("chart.modeStandard")}
      >
        <IconBarChart />
      </ModeButton>

      <ModeButton
        isActive={mode === "walter-lieth"}
        onClick={() => onChange("walter-lieth")}
        title={t("chart.modeWalterLieth")}
      >
        <IconAreaChart />
      </ModeButton>
    </div>
  );
}

"use client";

import { Card } from "@/components/Card";
import { Button } from "@/components/UI";
import { INFO_SECTION_IDS } from "@/constants";
import { EButtonVariant, ECardBackground, ECardSize } from "@/enums";
import { useCopyToClipboard } from "@/hooks/ui";
import { useTranslations } from "next-intl";
import { COPY_FEEDBACK_KEYS as FEEDBACK_KEYS, INFO_CLASSES as C } from "../info.constant";
import type { THowToCiteProps } from "../info.type";
import { InfoSection } from "./InfoSection";

export function HowToCite({ citation, bibtex }: THowToCiteProps) {
  const t = useTranslations();
  const citationCopy = useCopyToClipboard();
  const bibtexCopy = useCopyToClipboard();
  const feedbackKey =
    FEEDBACK_KEYS[citationCopy.status] ?? FEEDBACK_KEYS[bibtexCopy.status] ?? null;

  return (
    <InfoSection id={INFO_SECTION_IDS.CITE} intro={t("info.about.cite.intro")}>
      <Card size={ECardSize.MD} background={ECardBackground.MUTED}>
        <pre className={C.CODE}>{citation}</pre>
      </Card>
      <div className={C.ACTIONS}>
        <Button
          variant={EButtonVariant.SECONDARY}
          onClick={() => void citationCopy.copy(citation)}
          className={C.BUTTON}
        >
          {t("info.about.cite.copyCitation")}
        </Button>
        {bibtex !== "" && (
          <Button
            variant={EButtonVariant.SECONDARY}
            onClick={() => void bibtexCopy.copy(bibtex)}
            className={C.BUTTON}
          >
            {t("info.about.cite.copyBibtex")}
          </Button>
        )}
        <p role="status" className={C.SMALL}>
          {feedbackKey !== null ? t(feedbackKey) : ""}
        </p>
      </div>
    </InfoSection>
  );
}

import { COPYRIGHT, FIRST_RELEASE_YEAR, PROPER_NAMES } from "@/constants";
import { formatCopyrightYears } from "@/utils/info.util";
import { getTranslations } from "next-intl/server";
import { INFO_CLASSES as C } from "../info.constant";

/**
 * The Info pages' footer: "© 2025–2026 GSIC-EMIC research group • Universidad de Valladolid" on
 * one line from lg; below lg two centred lines, the "•" gone. A server component: the current
 * year is the server's at render, so it can't differ at hydration. Inside <main> a <footer>
 * isn't a landmark by itself, hence the role.
 */
export async function InfoFooter() {
  const t = await getTranslations("info.footer");
  const years = formatCopyrightYears({
    firstYear: FIRST_RELEASE_YEAR,
    currentYear: new Date().getFullYear(),
  });

  return (
    <footer role="contentinfo" className={C.FOOTER}>
      <p>
        <span className={C.FOOTER_PART}>
          {COPYRIGHT.SYMBOL} {years} {t("researchGroup", { group: PROPER_NAMES.RESEARCH_GROUP })}
        </span>
        <span aria-hidden="true" className={C.FOOTER_SEPARATOR}>
          {COPYRIGHT.PARTS_SEPARATOR}
        </span>
        <span className={C.FOOTER_PART}>{PROPER_NAMES.UNIVERSITY}</span>
      </p>
    </footer>
  );
}

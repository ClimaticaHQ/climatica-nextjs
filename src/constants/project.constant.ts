import type { TProjectInfo } from "@/types";

// * proper names are never translated: they live here, not in the locale messages. The
// * university by its official name, in every language
export const PROPER_NAMES = {
  AUTHOR: "Andrii Kononenko",
  UNIVERSITY: "Universidad de Valladolid",
  RESEARCH_GROUP: "GSIC-EMIC",
  IUFOR: "iuFOR",
} as const;

// * the year Climatica was first released: the footer's copyright starts there
export const FIRST_RELEASE_YEAR = 2025;

// * the footer's line: "© 2025–2026 GSIC-EMIC research group • Universidad de Valladolid"
export const COPYRIGHT = {
  SYMBOL: "©",
  // * between the two parts on the one-line (lg) layout only
  PARTS_SEPARATOR: " • ",
  YEARS_SEPARATOR: "–",
} as const;

// * The one place the About page's project facts are configured. Empty values hide their element.
export const PROJECT_INFO: TProjectInfo = {
  repositoryUrl: "https://github.com/ClimaticaHQ/climatica-nextjs",
  changelogUrl: "https://github.com/ClimaticaHQ/climatica-nextjs/releases",
  // * package.json's license — a unit test keeps the two equal
  licence: "MIT",
  scrapiAuthor: "Guillermo Vega-Gorgojo",
  scrapiDocsUrl: "",
  // * the paper's, once it is published
  citation: "",
  bibtex: "",
};

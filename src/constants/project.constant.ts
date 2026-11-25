import type { TProjectInfo } from "@/types";

export const PROPER_NAMES = {
  AUTHOR: "Andrii Kononenko",
  UNIVERSITY: "Universidad de Valladolid",
  RESEARCH_GROUP: "GSIC-EMIC",
  IUFOR: "iuFOR",
  SCRAPI_AUTHOR: "Guillermo Vega-Gorgojo",
} as const;

export const PROFILE_URLS = {
  VEGA_GORGOJO: "https://www.gsic.uva.es/members/guiveg",
} as const;

export const FIRST_RELEASE_YEAR = 2025;

export const COPYRIGHT = {
  SYMBOL: "©",
  PARTS_SEPARATOR: " • ",
  YEARS_SEPARATOR: "–",
} as const;

export const PROJECT_INFO: TProjectInfo = {
  repositoryUrl: "https://github.com/ClimaticaHQ/climatica-nextjs",
  changelogUrl: "https://github.com/ClimaticaHQ/climatica-nextjs/releases",
  // * package.json's licence: a unit test keeps the two equal
  licence: "MIT",
  scrapiAuthor: PROPER_NAMES.SCRAPI_AUTHOR,
  scrapiAuthorUrl: PROFILE_URLS.VEGA_GORGOJO,
  scrapiDocsUrl: "",
  citation: "",
  bibtex: "",
};

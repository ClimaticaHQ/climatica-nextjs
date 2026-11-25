import type { TTeamMember } from "@/types";
import { PROFILE_URLS, PROPER_NAMES } from "./project.constant";

export const AFFILIATION_SEPARATOR = ", ";

const AFFILIATIONS = {
  GSIC_EMIC: [PROPER_NAMES.RESEARCH_GROUP, PROPER_NAMES.UNIVERSITY].join(AFFILIATION_SEPARATOR),
  IUFOR: [PROPER_NAMES.IUFOR, PROPER_NAMES.UNIVERSITY].join(AFFILIATION_SEPARATOR),
} as const;

export const TEAM: readonly TTeamMember[] = [
  {
    id: "kononenko",
    name: PROPER_NAMES.AUTHOR,
    roleKey: "development",
    affiliation: AFFILIATIONS.GSIC_EMIC,
    profileUrl: "https://github.com/wastxrq",
  },
  {
    id: "vega-gorgojo",
    name: PROPER_NAMES.SCRAPI_AUTHOR,
    roleKey: "supervisionScrapi",
    affiliation: AFFILIATIONS.GSIC_EMIC,
    profileUrl: PROFILE_URLS.VEGA_GORGOJO,
  },
  {
    id: "gomez-sanchez",
    name: "Eduardo Gómez-Sánchez",
    roleKey: "supervision",
    affiliation: AFFILIATIONS.GSIC_EMIC,
    profileUrl: "https://www.gsic.uva.es/members/edugom",
  },
  {
    id: "garcia-zarza",
    name: "Pablo García Zarza",
    roleKey: "designAdvice",
    affiliation: AFFILIATIONS.GSIC_EMIC,
    profileUrl: "https://www.gsic.uva.es/members/pablogz",
  },
  {
    id: "bravo",
    name: "Felipe Bravo",
    roleKey: "forestManagement",
    affiliation: AFFILIATIONS.IUFOR,
    profileUrl: "https://iufor.uva.es/investigacion/equipo-investigacion/felipe-bravo-oviedo/",
  },
];

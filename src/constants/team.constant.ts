import type { TTeamMember } from "@/types";
import { PROPER_NAMES } from "./project.constant";

// * between an affiliation's parts; the team card breaks a line only here
export const AFFILIATION_SEPARATOR = ", ";

// * the affiliations, from the proper names: "GSIC-EMIC, Universidad de Valladolid"
const AFFILIATIONS = {
  GSIC_EMIC: [PROPER_NAMES.RESEARCH_GROUP, PROPER_NAMES.UNIVERSITY].join(AFFILIATION_SEPARATOR),
  IUFOR: [PROPER_NAMES.IUFOR, PROPER_NAMES.UNIVERSITY].join(AFFILIATION_SEPARATOR),
} as const;

// * the About page's team: the developer, the supervisors, those advising the work, then
// * external contributors. Names, affiliations and links aren't translated; roles are keys of
// * info.about.team.roles
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
    name: "Guillermo Vega-Gorgojo",
    roleKey: "supervisionScrapi",
    affiliation: AFFILIATIONS.GSIC_EMIC,
    profileUrl: "https://www.gsic.uva.es/members/guiveg",
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

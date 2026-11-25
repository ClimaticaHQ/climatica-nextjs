import { REFERENCES } from "@/components/info/info.constant";
import { REFERENCE_LINKS } from "@/constants";
import { getReferenceLink, getScholarSearchUrl } from "@/utils/info.util";
import { describe, expect, it } from "vitest";

const SCHOLAR = "https://scholar.google.com/scholar?q=";

describe("getScholarSearchUrl", () => {
  it("searches the exact title, quoted and URL-encoded", () => {
    const url = getScholarSearchUrl("Une nouvelle fonction climatologique : l'indice d'aridité");
    expect(url.startsWith(SCHOLAR)).toBe(true);
    expect(decodeURIComponent(url.slice(SCHOLAR.length))).toBe(
      "\"Une nouvelle fonction climatologique : l'indice d'aridité\"",
    );
    // * one parameter: spaces, quotes, the colon and accents encoded (an apostrophe is valid as is)
    expect(url.slice(SCHOLAR.length)).not.toMatch(/[ ":àé&#]/);
  });
});

describe("getReferenceLink", () => {
  it("keeps a DOI, shown as doi:", () => {
    expect(getReferenceLink({ url: "https://doi.org/10.1002/joc.5086" })).toEqual({
      href: "https://doi.org/10.1002/joc.5086",
      label: "doi:10.1002/joc.5086",
    });
  });

  it("searches Scholar for a title without a DOI, labelled Google Scholar", () => {
    expect(getReferenceLink({ title: "Klimadiagramm-Weltatlas" })).toEqual({
      href: `${SCHOLAR}%22Klimadiagramm-Weltatlas%22`,
      label: REFERENCE_LINKS.SCHOLAR_LABEL,
    });
  });

  it("gives the references: DOIs for Fick and Harris, Scholar for Walter–Lieth and de Martonne", () => {
    const links = Object.fromEntries(
      REFERENCES.map((reference) => [reference.key, getReferenceLink(reference)?.label]),
    );
    expect(links).toEqual({
      fick: "doi:10.1002/joc.5086",
      harris: "doi:10.1038/s41597-020-0453-3",
      walter: "Google Scholar",
      martonne: "Google Scholar",
    });
    for (const reference of REFERENCES.filter(({ url }) => url === undefined)) {
      expect(reference.text).toContain(reference.title);
    }
  });
});

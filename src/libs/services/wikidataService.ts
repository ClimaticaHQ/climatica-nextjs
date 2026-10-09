import "server-only";

import { ENDPOINTS } from "@/constants";
import type { TCity, TWikidataEntitiesResult, TWikidataGeoSearchResult } from "@/types";
import axios from "axios";

export const WikidataService = {
  async findNearestCityByCoordinates(lat: number, lng: number): Promise<TCity | null> {
    const lang = "en";

    const geoSearchRes = await axios.get<TWikidataGeoSearchResult>(ENDPOINTS.WIKIDATA, {
      params: {
        action: "query",
        list: "geosearch",
        gscoord: `${lat}|${lng}`,
        gsradius: 10000,
        gslimit: 5,
        format: "json",
        origin: "*",
      },
      headers: {
        "User-Agent": "Climatica/1.0 (wastardy.k@gmail.com) axios/1.16.1",
      },
    });

    const geosearch = geoSearchRes.data.query?.geosearch;
    if (!Array.isArray(geosearch) || geosearch.length === 0) {
      return null;
    }

    const geoItems = geosearch.filter(
      (item) => item && typeof item.title === "string" && /^Q\d+$/.test(item.title),
    );

    if (geoItems.length === 0) return null;

    const ids = geoItems.map((item) => item.title).join("|");

    const entitiesRes = await axios.get<TWikidataEntitiesResult>(ENDPOINTS.WIKIDATA, {
      params: {
        action: "wbgetentities",
        ids,
        props: "labels|descriptions",
        languages: `${lang}|en`,
        format: "json",
        origin: "*",
      },
      headers: {
        "User-Agent": "Climatica/1.0 (wastardy.k@gmail.com) axios/1.16.1",
      },
    });

    const entities = entitiesRes.data.entities;

    for (const geoItem of geoItems) {
      const id = geoItem.title;
      const entity = entities[id];
      if (!entity) continue;

      const label = entity.labels?.[lang]?.value ?? entity.labels?.["en"]?.value ?? "";
      const description =
        entity.descriptions?.[lang]?.value ?? entity.descriptions?.["en"]?.value ?? "";

      return {
        id,
        label: label || id,
        description,
        lat: geoItem.lat,
        lng: geoItem.lon,
      };
    }

    return null;
  },
};

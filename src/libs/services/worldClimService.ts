import { WORLDCLIM_PROXY_BASE } from "@/constants";
import { apiClient } from "@/libs/api";
import type {
  TCellSize,
  TClimatePeriod,
  TRawAvgValueResponse,
  TRawPixelValueResponse,
  TVariable,
  TWorldClimAvgBoxBinding,
  TWorldClimCellResource,
  TWorldClimCellResponse,
  TWorldClimPixelResource,
  TWorldClimPointValueResponse,
} from "@/types";
import {
  buildDatasetParams,
  buildGridIri,
  buildVariableIris,
  extractCellBySize,
  groupAvgBindings,
  validateResponseData,
} from "@/utils";

export const WorldClimService = {
  async getCellsForPoint(lat: number, lng: number) {
    const response = await apiClient.get<TWorldClimCellResponse>(
      `${WORLDCLIM_PROXY_BASE}/cellofpoint`,
      { params: { lat, lng } },
    );
    validateResponseData(response);
    return response.data;
  },

  async getCellForPoint(lat: number, lng: number, gridSize: TCellSize): Promise<string | null> {
    const response = await apiClient.get<TWorldClimCellResponse>(
      `${WORLDCLIM_PROXY_BASE}/cellofpoint`,
      { params: { lat, lng } },
    );
    validateResponseData(response);
    return extractCellBySize(response.data, gridSize);
  },

  async getCellResource(cellIri: string): Promise<TWorldClimCellResource> {
    const response = await apiClient.get<TWorldClimCellResource>(
      `${WORLDCLIM_PROXY_BASE}/resource`,
      {
        params: { id: "Cell", iri: cellIri },
      },
    );
    validateResponseData(response);
    return response.data;
  },

  async getClimateDataForPoint(
    lat: number,
    lng: number,
    gridSize: TCellSize,
    variables: readonly TVariable[],
    period: TClimatePeriod,
  ): Promise<TWorldClimPointValueResponse> {
    const response = await apiClient.get<TWorldClimPointValueResponse>(
      `${WORLDCLIM_PROXY_BASE}/pixelvaluesofapoint`,
      {
        params: {
          lat,
          lng,
          grid: buildGridIri(gridSize),
          var: buildVariableIris(variables),
          isClimate: true,
        },
      },
    );
    validateResponseData(response);
    return {
      results: {
        bindings: response.data.results.bindings.filter((b) => b.raster.value.includes(period)),
      },
    };
  },

  async getWeatherDataForPoint(
    lat: number,
    lng: number,
    gridSize: TCellSize,
    variables: readonly TVariable[],
    year: number,
  ): Promise<TWorldClimPointValueResponse> {
    const response = await apiClient.get<TWorldClimPointValueResponse>(
      `${WORLDCLIM_PROXY_BASE}/pixelvaluesofapoint`,
      {
        params: {
          lat,
          lng,
          grid: buildGridIri(gridSize),
          var: buildVariableIris(variables),
          isWeather: true,
          year,
        },
      },
    );
    validateResponseData(response);
    return response.data;
  },

  async getPixelResource(pixelIri: string) {
    const response = await apiClient.get<TWorldClimPixelResource>(
      `${WORLDCLIM_PROXY_BASE}/resource`,
      {
        params: { id: "Pixel", iri: pixelIri },
      },
    );
    validateResponseData(response);
    return response.data;
  },

  async getPixelValuesInBox(
    north: number,
    south: number,
    west: number,
    east: number,
    gridSize: TCellSize,
    variables: string[],
    isClimate: boolean,
    year?: number,
    avg?: boolean,
  ): Promise<TRawPixelValueResponse | TRawAvgValueResponse> {
    const endpoint = avg ? "avgpixelvaluesinbox" : "pixelvaluesinbox";
    const response = await apiClient.get<TRawPixelValueResponse | TRawAvgValueResponse>(
      `${WORLDCLIM_PROXY_BASE}/${endpoint}`,
      {
        params: {
          north,
          south,
          west,
          east,
          grid: buildGridIri(gridSize),
          var: buildVariableIris(variables),
          ...buildDatasetParams(isClimate, year),
        },
      },
    );
    validateResponseData(response);
    return response.data;
  },

  async getPixelValuesInPolygon(
    wkt: string,
    gridSize: TCellSize,
    variables: string[],
    isClimate: boolean,
    year?: number,
    avg?: boolean,
  ): Promise<TRawPixelValueResponse | TRawAvgValueResponse> {
    const endpoint = avg ? "avgpixelvaluesinpolygonGEO" : "pixelvaluesinpolygonGEO";
    const response = await apiClient.get<TRawPixelValueResponse | TRawAvgValueResponse>(
      `${WORLDCLIM_PROXY_BASE}/${endpoint}`,
      {
        params: {
          polygon: wkt,
          grid: buildGridIri(gridSize),
          var: buildVariableIris(variables),
          ...buildDatasetParams(isClimate, year),
        },
      },
    );
    validateResponseData(response);
    return response.data;
  },

  async getRegionalAverage(
    variables: readonly TVariable[],
    gridSize: TCellSize,
    area: { bbox: { north: number; south: number; west: number; east: number } } | { wkt: string },
    isClimate: boolean,
    period?: TClimatePeriod,
    year?: number,
  ): Promise<TWorldClimAvgBoxBinding | null> {
    const response =
      "bbox" in area
        ? await this.getPixelValuesInBox(
            area.bbox.north,
            area.bbox.south,
            area.bbox.west,
            area.bbox.east,
            gridSize,
            variables as string[],
            isClimate,
            year,
            true,
          )
        : await this.getPixelValuesInPolygon(
            area.wkt,
            gridSize,
            variables as string[],
            isClimate,
            year,
            true,
          );

    const grouped = groupAvgBindings((response as TRawAvgValueResponse).results.bindings);
    const filtered =
      isClimate && period ? grouped.filter((b) => b.raster?.value?.includes(period)) : grouped;

    return filtered[0] ?? null;
  },
};

import { WORLDCLIM_PROXY_BASE } from "@/constants";
import type {
  TCellSize,
  TClimatePeriod,
  TRawAvgValueResponse,
  TRawPixelValueResponse,
  TVariable,
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
  validateResponseData,
} from "@/utils";
import axios from "axios";

export const WorldClimService = {
  async getCellsForPoint(lat: number, lng: number) {
    const response = await axios.get<TWorldClimCellResponse>(
      `${WORLDCLIM_PROXY_BASE}/cellofpoint`,
      { params: { lat, lng } },
    );
    validateResponseData(response);
    return response.data;
  },

  async getCellForPoint(lat: number, lng: number, gridSize: TCellSize): Promise<string | null> {
    const response = await axios.get<TWorldClimCellResponse>(
      `${WORLDCLIM_PROXY_BASE}/cellofpoint`,
      { params: { lat, lng } },
    );
    validateResponseData(response);
    return extractCellBySize(response.data, gridSize);
  },

  async getCellResource(cellIri: string): Promise<TWorldClimCellResource> {
    const response = await axios.get<TWorldClimCellResource>(`${WORLDCLIM_PROXY_BASE}/resource`, {
      params: { id: "Cell", iri: cellIri },
    });
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
    const response = await axios.get<TWorldClimPointValueResponse>(
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
    const response = await axios.get<TWorldClimPointValueResponse>(
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
    const response = await axios.get<TWorldClimPixelResource>(`${WORLDCLIM_PROXY_BASE}/resource`, {
      params: { id: "Pixel", iri: pixelIri },
    });
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
  ): Promise<TRawPixelValueResponse> {
    const response = await axios.get<TRawPixelValueResponse>(
      `${WORLDCLIM_PROXY_BASE}/pixelvaluesinbox`,
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

  async getAvgPixelValuesInBox(
    north: number,
    south: number,
    west: number,
    east: number,
    gridSize: TCellSize,
    variables: string[],
    isClimate: boolean,
    year?: number,
  ): Promise<TRawAvgValueResponse> {
    const response = await axios.get<TRawAvgValueResponse>(
      `${WORLDCLIM_PROXY_BASE}/avgpixelvaluesinbox`,
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
  ): Promise<TRawPixelValueResponse> {
    const response = await axios.get<TRawPixelValueResponse>(
      `${WORLDCLIM_PROXY_BASE}/pixelvaluesinpolygonGEO`,
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

  async getAvgPixelValuesInPolygon(
    wkt: string,
    gridSize: TCellSize,
    variables: string[],
    isClimate: boolean,
    year?: number,
  ): Promise<TRawAvgValueResponse> {
    const response = await axios.get<TRawAvgValueResponse>(
      `${WORLDCLIM_PROXY_BASE}/avgpixelvaluesinpolygonGEO`,
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
};

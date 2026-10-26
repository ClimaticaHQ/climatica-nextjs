import { WORLDCLIM_PROXY_BASE } from "@/constants";
import { apiClient } from "@/libs/api";
import type {
  TCellSize,
  TRawAvgValueResponse,
  TRawPixelValueResponse,
  TRegionQueryArgs,
  TVariable,
  TWorldClimAvgBoxBinding,
  TWorldClimCellResource,
  TWorldClimCellResponse,
  TWorldClimPixelResource,
  TWorldClimPointValueResponse,
  TWorldClimRasterResource,
} from "@/types";
import {
  buildGridIri,
  buildRegionQueryParams,
  buildVariableIris,
  extractCellBySize,
  getPolygonBounds,
  getRowsPerCell,
  getStripRowLimit,
  groupAvgBindings,
  keepCellsInPolygon,
  mergeStripBindings,
  polygonToWkt,
  splitRegionIntoStrips,
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

  /**
   * SCRAPI returns every climate period's rasters in one response for a point — no period param
   * to send. Callers narrow to one period (filterPointBindingsByPeriod) or read them all
   * (extractAvailableClimatePeriods, which tells the periods a place has no data for) from the
   * same cached fetch.
   */
  async getClimateDataForPoint(
    lat: number,
    lng: number,
    gridSize: TCellSize,
    variables: readonly TVariable[],
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
    return response.data;
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

  async getRasterResource(rasterIri: string): Promise<TWorldClimRasterResource> {
    const response = await apiClient.get<TWorldClimRasterResource>(
      `${WORLDCLIM_PROXY_BASE}/resource`,
      {
        params: { id: "Raster", iri: rasterIri },
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

  /**
   * Every cell's monthly values in a region, fetched as strips WorldClim answers in full and
   * merged. A polygon is read from the strips of the box around it, keeping the cells whose
   * centroid lies inside — the same cells as WorldClim's polygon query.
   */
  async getRegionPixelValues({
    area,
    gridSize,
    variables,
    dataset,
  }: TRegionQueryArgs): Promise<TRawPixelValueResponse> {
    const bounds = "bbox" in area ? area.bbox : getPolygonBounds(area.polygon);
    const rowsPerCell = getRowsPerCell(variables);
    const strips = splitRegionIntoStrips({ bounds, gridSize, rowsPerCell });
    const responses = await Promise.all(
      strips.map((strip) =>
        apiClient.get<TRawPixelValueResponse>(`${WORLDCLIM_PROXY_BASE}/pixelvaluesinbox`, {
          params: {
            ...strip,
            ...buildRegionQueryParams(gridSize, variables, dataset),
            limit: getStripRowLimit(strip, gridSize, rowsPerCell),
          },
        }),
      ),
    );
    responses.forEach(validateResponseData);
    const bindings = mergeStripBindings(responses.map((r) => r.data.results.bindings));
    return {
      results: {
        bindings:
          "polygon" in area ? keepCellsInPolygon(bindings, area.polygon, gridSize) : bindings,
      },
    };
  },

  /** The region's monthly averages, one binding per variable: WorldClim averages the cells. */
  async getRegionAverages({
    area,
    gridSize,
    variables,
    dataset,
  }: TRegionQueryArgs): Promise<TWorldClimAvgBoxBinding[]> {
    const [endpoint, areaParams] =
      "bbox" in area
        ? (["avgpixelvaluesinbox", area.bbox] as const)
        : (["avgpixelvaluesinpolygonGEO", { polygon: polygonToWkt(area.polygon) }] as const);
    const response = await apiClient.get<TRawAvgValueResponse>(
      `${WORLDCLIM_PROXY_BASE}/${endpoint}`,
      {
        params: {
          ...areaParams,
          ...buildRegionQueryParams(gridSize, variables, dataset),
          limit: getRowsPerCell(variables),
        },
      },
    );
    validateResponseData(response);
    return groupAvgBindings(response.data.results.bindings);
  },
};

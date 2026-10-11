import { apiClient } from "@/lib/api-client";
import { buildQueryParams } from "@/utils/query-params";
import type { IPaginatedResult } from "@/types/api";
import type { ICity, ICityPayload, ICityQueryParams } from "@/types/city";

const CITIES_PATH = "/cities";

export const fetchCities = async (
  params: ICityQueryParams,
): Promise<IPaginatedResult<ICity>> => {
  const { data } = await apiClient.get<IPaginatedResult<ICity>>(CITIES_PATH, {
    params: buildQueryParams({ ...params }),
  });

  return data;
};

export const createCity = async (payload: ICityPayload): Promise<ICity> => {
  const { data } = await apiClient.post<ICity>(CITIES_PATH, payload);
  return data;
};

export const updateCity = async (id: string, payload: ICityPayload): Promise<ICity> => {
  const { data } = await apiClient.patch<ICity>(`${CITIES_PATH}/${id}`, payload);
  return data;
};

// DELETE deactivates — the row is kept so it can be restored
export const deactivateCity = async (id: string): Promise<ICity> => {
  const { data } = await apiClient.delete<ICity>(`${CITIES_PATH}/${id}`);
  return data;
};

export const restoreCity = async (id: string): Promise<ICity> => {
  const { data } = await apiClient.patch<ICity>(`${CITIES_PATH}/${id}/restore`);
  return data;
};

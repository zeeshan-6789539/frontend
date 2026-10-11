import { apiClient } from "@/lib/api-client";
import { buildQueryParams } from "@/utils/query-params";
import type { IPaginatedResult } from "@/types/api";
import type { IArea, IAreaPayload, IAreaQueryParams } from "@/types/area";

const AREAS_PATH = "/areas";

export const fetchAreas = async (
  params: IAreaQueryParams,
): Promise<IPaginatedResult<IArea>> => {
  const { data } = await apiClient.get<IPaginatedResult<IArea>>(AREAS_PATH, {
    params: buildQueryParams({ ...params }),
  });

  return data;
};

export const createArea = async (payload: IAreaPayload): Promise<IArea> => {
  const { data } = await apiClient.post<IArea>(AREAS_PATH, payload);
  return data;
};

export const updateArea = async (id: string, payload: IAreaPayload): Promise<IArea> => {
  const { data } = await apiClient.patch<IArea>(`${AREAS_PATH}/${id}`, payload);
  return data;
};

// DELETE deactivates — the row is kept so it can be restored
export const deactivateArea = async (id: string): Promise<IArea> => {
  const { data } = await apiClient.delete<IArea>(`${AREAS_PATH}/${id}`);
  return data;
};

export const restoreArea = async (id: string): Promise<IArea> => {
  const { data } = await apiClient.patch<IArea>(`${AREAS_PATH}/${id}/restore`);
  return data;
};

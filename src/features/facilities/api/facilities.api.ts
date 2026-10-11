import { apiClient } from "@/lib/api-client";
import { buildQueryParams } from "@/utils/query-params";
import type { IPaginatedResult } from "@/types/api";
import type {
  IFacility,
  IFacilityPayload,
  IFacilityQueryParams,
} from "@/types/facility";

const FACILITIES_PATH = "/facilities";

export const fetchFacilities = async (
  params: IFacilityQueryParams,
): Promise<IPaginatedResult<IFacility>> => {
  const { data } = await apiClient.get<IPaginatedResult<IFacility>>(
    FACILITIES_PATH,
    { params: buildQueryParams({ ...params }) },
  );

  return data;
};

export const createFacility = async (
  payload: IFacilityPayload,
): Promise<IFacility> => {
  const { data } = await apiClient.post<IFacility>(FACILITIES_PATH, payload);
  return data;
};

export const updateFacility = async (
  id: string,
  payload: IFacilityPayload,
): Promise<IFacility> => {
  const { data } = await apiClient.patch<IFacility>(
    `${FACILITIES_PATH}/${id}`,
    payload,
  );
  return data;
};

// DELETE deactivates — the row is kept so it can be restored
export const deactivateFacility = async (id: string): Promise<IFacility> => {
  const { data } = await apiClient.delete<IFacility>(`${FACILITIES_PATH}/${id}`);
  return data;
};

export const restoreFacility = async (id: string): Promise<IFacility> => {
  const { data } = await apiClient.patch<IFacility>(
    `${FACILITIES_PATH}/${id}/restore`,
  );
  return data;
};

import { apiClient } from "@/lib/api-client";
import { buildQueryParams } from "@/utils/query-params";
import type { IPaginatedResult } from "@/types/api";
import type {
  IProperty,
  IPropertyPayload,
  IPropertyQueryParams,
} from "@/types/property";

const PROPERTIES_PATH = "/properties";

export const fetchProperties = async (
  params: IPropertyQueryParams,
): Promise<IPaginatedResult<IProperty>> => {
  const { data } = await apiClient.get<IPaginatedResult<IProperty>>(PROPERTIES_PATH, {
    params: buildQueryParams({ ...params }),
  });

  return data;
};

export const createProperty = async (payload: IPropertyPayload): Promise<IProperty> => {
  const { data } = await apiClient.post<IProperty>(PROPERTIES_PATH, payload);
  return data;
};

// Partial so a single field, like the property status, can be changed on its own
export const updateProperty = async (
  id: string,
  payload: Partial<IPropertyPayload>,
): Promise<IProperty> => {
  const { data } = await apiClient.patch<IProperty>(`${PROPERTIES_PATH}/${id}`, payload);
  return data;
};

// DELETE deactivates — the row is kept so it can be restored
export const deactivateProperty = async (id: string): Promise<IProperty> => {
  const { data } = await apiClient.delete<IProperty>(`${PROPERTIES_PATH}/${id}`);
  return data;
};

export const restoreProperty = async (id: string): Promise<IProperty> => {
  const { data } = await apiClient.patch<IProperty>(`${PROPERTIES_PATH}/${id}/restore`);
  return data;
};

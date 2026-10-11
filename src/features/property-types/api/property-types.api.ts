import { apiClient } from "@/lib/api-client";
import { buildQueryParams } from "@/utils/query-params";
import type { IPaginatedResult } from "@/types/api";
import type {
  IPropertyType,
  IPropertyTypePayload,
  IPropertyTypeQueryParams,
} from "@/types/property-type";

const PROPERTY_TYPES_PATH = "/property-types";

export const fetchPropertyTypes = async (
  params: IPropertyTypeQueryParams,
): Promise<IPaginatedResult<IPropertyType>> => {
  const { data } = await apiClient.get<IPaginatedResult<IPropertyType>>(
    PROPERTY_TYPES_PATH,
    { params: buildQueryParams({ ...params }) },
  );

  return data;
};

export const createPropertyType = async (
  payload: IPropertyTypePayload,
): Promise<IPropertyType> => {
  const { data } = await apiClient.post<IPropertyType>(PROPERTY_TYPES_PATH, payload);
  return data;
};

export const updatePropertyType = async (
  id: string,
  payload: IPropertyTypePayload,
): Promise<IPropertyType> => {
  const { data } = await apiClient.patch<IPropertyType>(
    `${PROPERTY_TYPES_PATH}/${id}`,
    payload,
  );
  return data;
};

// DELETE deactivates — the row is kept so it can be restored
export const deactivatePropertyType = async (id: string): Promise<IPropertyType> => {
  const { data } = await apiClient.delete<IPropertyType>(`${PROPERTY_TYPES_PATH}/${id}`);
  return data;
};

export const restorePropertyType = async (id: string): Promise<IPropertyType> => {
  const { data } = await apiClient.patch<IPropertyType>(
    `${PROPERTY_TYPES_PATH}/${id}/restore`,
  );
  return data;
};

import { apiClient } from "@/lib/api-client";
import { buildQueryParams } from "@/utils/query-params";
import type { IPaginatedResult } from "@/types/api";
import type { IProperty } from "@/types/property";
import type {
  IPropertyRequirement,
  IPropertyRequirementPayload,
  IPropertyRequirementQueryParams,
  IRequirementMatchQueryParams,
} from "@/types/property-requirement";

const REQUIREMENTS_PATH = "/property-requirements";

export const fetchPropertyRequirements = async (
  params: IPropertyRequirementQueryParams,
): Promise<IPaginatedResult<IPropertyRequirement>> => {
  const { data } = await apiClient.get<IPaginatedResult<IPropertyRequirement>>(
    REQUIREMENTS_PATH,
    { params: buildQueryParams({ ...params }) },
  );

  return data;
};

export const fetchRequirementMatches = async (
  id: string,
  params: IRequirementMatchQueryParams,
): Promise<IPaginatedResult<IProperty>> => {
  const { data } = await apiClient.get<IPaginatedResult<IProperty>>(
    `${REQUIREMENTS_PATH}/${id}/matches`,
    { params: buildQueryParams({ ...params }) },
  );

  return data;
};

export const createPropertyRequirement = async (
  payload: IPropertyRequirementPayload,
): Promise<IPropertyRequirement> => {
  const { data } = await apiClient.post<IPropertyRequirement>(REQUIREMENTS_PATH, payload);
  return data;
};

// Partial so a single field, like the requirement status, can be changed on its own
export const updatePropertyRequirement = async (
  id: string,
  payload: Partial<IPropertyRequirementPayload>,
): Promise<IPropertyRequirement> => {
  const { data } = await apiClient.patch<IPropertyRequirement>(
    `${REQUIREMENTS_PATH}/${id}`,
    payload,
  );
  return data;
};

// Marks the chosen listing sold or rented and the requirement matched
export const matchPropertyRequirement = async (
  id: string,
  propertyId: string,
): Promise<IPropertyRequirement> => {
  const { data } = await apiClient.patch<IPropertyRequirement>(
    `${REQUIREMENTS_PATH}/${id}/match`,
    { propertyId },
  );
  return data;
};

// DELETE deactivates — the row is kept so it can be restored
export const deactivatePropertyRequirement = async (
  id: string,
): Promise<IPropertyRequirement> => {
  const { data } = await apiClient.delete<IPropertyRequirement>(`${REQUIREMENTS_PATH}/${id}`);
  return data;
};

export const restorePropertyRequirement = async (
  id: string,
): Promise<IPropertyRequirement> => {
  const { data } = await apiClient.patch<IPropertyRequirement>(
    `${REQUIREMENTS_PATH}/${id}/restore`,
  );
  return data;
};

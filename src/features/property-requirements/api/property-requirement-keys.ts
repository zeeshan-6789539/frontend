import type {
  IPropertyRequirementQueryParams,
  IRequirementMatchQueryParams,
} from "@/types/property-requirement";

export const propertyRequirementKeys = {
  all: ["property-requirements"] as const,
  lists: () => [...propertyRequirementKeys.all, "list"] as const,
  list: (params: IPropertyRequirementQueryParams) =>
    [...propertyRequirementKeys.lists(), params] as const,
  matches: (id: string, params: IRequirementMatchQueryParams) =>
    [...propertyRequirementKeys.all, "matches", id, params] as const,
};

import type { IPropertyTypeQueryParams } from "@/types/property-type";

export const propertyTypeKeys = {
  all: ["property-types"] as const,
  lists: () => [...propertyTypeKeys.all, "list"] as const,
  list: (params: IPropertyTypeQueryParams) => [...propertyTypeKeys.lists(), params] as const,
};

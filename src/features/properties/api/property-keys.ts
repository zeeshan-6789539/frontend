import type { IPropertyQueryParams } from "@/types/property";

export const propertyKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  list: (params: IPropertyQueryParams) => [...propertyKeys.lists(), params] as const,
};

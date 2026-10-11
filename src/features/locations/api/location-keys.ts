import type { IAreaQueryParams } from "@/types/area";
import type { ICityQueryParams } from "@/types/city";

export const cityKeys = {
  all: ["cities"] as const,
  lists: () => [...cityKeys.all, "list"] as const,
  list: (params: ICityQueryParams) => [...cityKeys.lists(), params] as const,
};

export const areaKeys = {
  all: ["areas"] as const,
  lists: () => [...areaKeys.all, "list"] as const,
  list: (params: IAreaQueryParams) => [...areaKeys.lists(), params] as const,
};

import type { IFacilityQueryParams } from "@/types/facility";

export const facilityKeys = {
  all: ["facilities"] as const,
  lists: () => [...facilityKeys.all, "list"] as const,
  list: (params: IFacilityQueryParams) =>
    [...facilityKeys.lists(), params] as const,
};

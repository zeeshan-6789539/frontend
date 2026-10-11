import type { IContactQueryParams } from "@/types/contact";

export const contactKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  list: (params: IContactQueryParams) => [...contactKeys.lists(), params] as const,
};

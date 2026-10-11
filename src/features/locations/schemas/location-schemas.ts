import { z } from "zod";

// Mirror CreateCityDto / CreateAreaDto — messages are message-catalogue keys, resolved at render
export const citySchema = z.object({
  name: z.string().min(2, "cityNameLength").max(100, "cityNameLength"),
  status: z.boolean(),
});

export const areaSchema = z.object({
  cityId: z.string().min(1, "cityRequired"),
  name: z.string().min(2, "areaNameLength").max(150, "areaNameLength"),
  status: z.boolean(),
});

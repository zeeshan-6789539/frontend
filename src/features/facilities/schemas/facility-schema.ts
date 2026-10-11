import { z } from "zod";

// Mirrors CreateFacilityDto — messages are message-catalogue keys, resolved at render
export const facilitySchema = z.object({
  name: z.string().min(2, "nameLength").max(100, "nameLength"),
  status: z.boolean(),
});

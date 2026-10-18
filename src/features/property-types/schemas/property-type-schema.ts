import { z } from "zod";

// Mirrors CreatePropertyTypeDto — messages are message-catalogue keys, resolved at render
export const propertyTypeSchema = z.object({
  name: z.string().min(2, "nameLength").max(100, "nameLength"),
  status: z.boolean(),
});

import { z } from "zod";
import { MAX_RENT_DUE_DAY, MIN_RENT_DUE_DAY } from "@/config/property";

// Mirrors CreatePropertyDto — messages are message-catalogue keys, resolved at render
export const propertySchema = z.object({
  name: z.string().min(2, "nameLength").max(255, "nameLength"),
  addressLine1: z.string().min(1, "addressLine1Length").max(500, "addressLine1Length"),
  city: z.string().min(1, "cityLength").max(100, "cityLength"),
  propertyTypeId: z.uuid("propertyTypeInvalid"),
  rentDueDay: z
    .number("rentDueDayRange")
    .int("rentDueDayRange")
    .min(MIN_RENT_DUE_DAY, "rentDueDayRange")
    .max(MAX_RENT_DUE_DAY, "rentDueDayRange"),
  status: z.boolean(),
});

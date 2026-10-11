import { z } from "zod";
import { MAX_AMOUNT, MAX_AREA_SQFT, MAX_FACILITIES } from "@/config/limits";
import { PROPERTY_PURPOSES, PROPERTY_STATUSES } from "@/config/property";

const amount = z
  .number({ error: "amountInvalid" })
  .int("amountInvalid")
  .min(0, "amountInvalid")
  .max(MAX_AMOUNT, "amountInvalid");

// Mirrors CreatePropertyDto — messages are message-catalogue keys, resolved at render
export const propertySchema = z.object({
  propertyTypeId: z.string().min(1, "propertyTypeRequired"),
  ownerContactId: z.string().nullable(),
  title: z.string().min(3, "titleLength").max(200, "titleLength"),
  description: z.string().max(5000, "descriptionLength").nullable(),
  purpose: z.enum(PROPERTY_PURPOSES),
  price: z
    .number({ error: "priceRequired" })
    .int("amountInvalid")
    .min(0, "amountInvalid")
    .max(MAX_AMOUNT, "amountInvalid"),
  securityDeposit: amount.nullable(),
  areaSqft: z
    .number({ error: "areaInvalid" })
    .int("areaInvalid")
    .min(1, "areaInvalid")
    .max(MAX_AREA_SQFT, "areaInvalid")
    .nullable(),
  facilityIds: z.array(z.string()).max(MAX_FACILITIES, "facilitiesMax"),
  floor: z.string().max(50, "floorLength").nullable(),
  cityId: z.string().min(1, "cityRequired"),
  areaId: z.string().nullable(),
  address: z.string().max(500, "addressLength").nullable(),
  propertyStatus: z.enum(PROPERTY_STATUSES),
  status: z.boolean(),
});

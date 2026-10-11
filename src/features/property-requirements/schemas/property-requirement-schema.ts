import { z } from "zod";
import { MAX_AMOUNT, MAX_FACILITIES, MAX_PREFERRED_AREAS } from "@/config/limits";
import { REQUIREMENT_PURPOSES, REQUIREMENT_STATUSES } from "@/config/property";

const budget = z
  .number({ error: "amountInvalid" })
  .int("amountInvalid")
  .min(0, "amountInvalid")
  .max(MAX_AMOUNT, "amountInvalid")
  .nullable();

// Mirrors CreatePropertyRequirementDto — messages are message-catalogue keys, resolved at render
export const propertyRequirementSchema = z
  .object({
    contactId: z.string().min(1, "contactRequired"),
    propertyTypeId: z.string().nullable(),
    purpose: z.enum(REQUIREMENT_PURPOSES),
    budgetMin: budget,
    budgetMax: budget,
    preferredCityId: z.string().nullable(),
    preferredAreaIds: z.array(z.string()).max(MAX_PREFERRED_AREAS, "areasMax"),
    facilityIds: z.array(z.string()).max(MAX_FACILITIES, "facilitiesMax"),
    notes: z.string().max(2000, "notesLength").nullable(),
    requirementStatus: z.enum(REQUIREMENT_STATUSES),
    status: z.boolean(),
  })
  .refine(
    (values) =>
      values.budgetMin === null ||
      values.budgetMax === null ||
      values.budgetMin <= values.budgetMax,
    { message: "budgetRange", path: ["budgetMax"] },
  )
  // Areas narrow a city, so they need one — mirrors the API rule
  .refine(
    (values) => values.preferredAreaIds.length === 0 || values.preferredCityId !== null,
    { message: "areasNeedCity", path: ["preferredAreaIds"] },
  );

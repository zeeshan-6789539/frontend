import { MAX_RENT_DUE_DAY, MIN_RENT_DUE_DAY } from "@/config/property";
import { propertyKeys } from "@/features/properties/api/property-keys";
import { createProperty } from "@/features/properties/api/properties.api";
import { propertySchema } from "@/features/properties/schemas/property-schema";
import { getNumber, getText } from "@/features/voice-assistant/forms/form-values";
import { buildPropertyLabel } from "@/utils/property";
import type { IPropertyPayload } from "@/types/property";
import type { IAssistantFormDef } from "@/types/voice-assistant";

export const propertyForm: IAssistantFormDef<IPropertyPayload> = {
  type: "property",
  titleKey: "assistant.forms.property",
  errorsKey: "properties.errors",
  listPath: "/properties",
  schema: propertySchema,
  defaults: { name: "", propertyTypeId: "", addressLine1: "", city: "", rentDueDay: "" },
  fields: [
    {
      key: "name",
      labelKey: "properties.fields.name",
      kind: "text",
      required: true,
      hint: "A short name for the property, 2-255 characters, e.g. 'Sunset Apartments flat 4'.",
    },
    {
      key: "propertyTypeId",
      labelKey: "properties.fields.propertyType",
      kind: "select",
      required: true,
      source: "propertyTypes",
      createWith: "propertyType",
      hint: "One of the company's own property types, e.g. home, apartment or shop. Read the options list for the exact choices.",
    },
    {
      key: "addressLine1",
      labelKey: "properties.fields.addressLine1",
      kind: "text",
      required: true,
    },
    { key: "city", labelKey: "properties.fields.city", kind: "text", required: true },
    {
      key: "rentDueDay",
      labelKey: "properties.fields.rentDueDay",
      kind: "number",
      required: true,
      hint: `Day of the month the rent is due, ${MIN_RENT_DUE_DAY} to ${MAX_RENT_DUE_DAY}. Most landlords use 1.`,
    },
  ],
  toPayload: (values) => ({
    name: getText(values, "name").trim(),
    addressLine1: getText(values, "addressLine1").trim(),
    city: getText(values, "city").trim(),
    propertyTypeId: getText(values, "propertyTypeId"),
    rentDueDay: getNumber(values, "rentDueDay"),
    status: true,
  }),
  submit: async (payload) => {
    const property = await createProperty(payload);
    return { id: property.id, label: buildPropertyLabel(property) };
  },
  invalidates: [propertyKeys.all],
};

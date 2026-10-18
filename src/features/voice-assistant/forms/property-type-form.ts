import { propertyKeys } from "@/features/properties/api/property-keys";
import { propertyTypeKeys } from "@/features/property-types/api/property-type-keys";
import { createPropertyType } from "@/features/property-types/api/property-types.api";
import { propertyTypeSchema } from "@/features/property-types/schemas/property-type-schema";
import { getText } from "@/features/voice-assistant/forms/form-values";
import type { IPropertyTypePayload } from "@/types/property-type";
import type { IAssistantFormDef } from "@/types/voice-assistant";

export const propertyTypeForm: IAssistantFormDef<IPropertyTypePayload> = {
  type: "propertyType",
  titleKey: "assistant.forms.propertyType",
  errorsKey: "propertyTypes.errors",
  listPath: "/property-types",
  schema: propertyTypeSchema,
  defaults: { name: "" },
  fields: [
    {
      key: "name",
      labelKey: "propertyTypes.fields.name",
      kind: "text",
      required: true,
      hint: "The type's name, 2-100 characters, e.g. 'Penthouse' or 'Plaza shop'. Must not repeat an existing type.",
    },
  ],
  toPayload: (values) => ({
    name: getText(values, "name").trim(),
    status: true,
  }),
  submit: async (payload) => {
    const propertyType = await createPropertyType(payload);
    return { id: propertyType.id, label: propertyType.name };
  },
  invalidates: [propertyTypeKeys.all, propertyKeys.all],
};

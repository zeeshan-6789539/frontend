import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import { createPropertyRequirement } from "@/features/property-requirements/api/property-requirements.api";
import { propertyRequirementSchema } from "@/features/property-requirements/schemas/property-requirement-schema";
import {
  getList,
  getNullableNumber,
  getNullableText,
  getText,
} from "@/features/voice-assistant/forms/form-values";
import type { IPropertyRequirementPayload } from "@/types/property-requirement";
import type { TRequirementPurpose } from "@/types/property";
import type { IAssistantFormDef } from "@/types/voice-assistant";

export const requirementForm: IAssistantFormDef<IPropertyRequirementPayload> = {
  type: "requirement",
  titleKey: "assistant.forms.requirement",
  errorsKey: "requirements.errors",
  listPath: "/requirements",
  schema: propertyRequirementSchema,
  defaults: {
    contactId: "",
    purpose: "",
    propertyTypeId: "",
    budgetMin: "",
    budgetMax: "",
    preferredCityId: "",
    preferredAreaIds: [],
    facilityIds: [],
    notes: "",
  },
  fields: [
    {
      key: "contactId",
      labelKey: "requirements.fields.seeker",
      kind: "select",
      required: true,
      source: "contacts",
      createWith: "contact",
      placeholderKey: "requirements.selectSeeker",
      hint: "The client looking for a property, an existing contact. Search by name or phone; offer to create a new contact if not found.",
    },
    {
      key: "purpose",
      labelKey: "requirements.fields.purpose",
      kind: "select",
      required: true,
      source: "requirementPurposes",
      hint: "Whether the client wants to buy or to rent.",
    },
    {
      key: "propertyTypeId",
      labelKey: "requirements.fields.propertyType",
      kind: "select",
      required: false,
      source: "propertyTypes",
      hint: "Leave empty when any type will do.",
    },
    {
      key: "budgetMin",
      labelKey: "requirements.fields.budgetMin",
      kind: "amount",
      required: false,
    },
    {
      key: "budgetMax",
      labelKey: "requirements.fields.budgetMax",
      kind: "amount",
      required: false,
    },
    {
      key: "preferredCityId",
      labelKey: "requirements.fields.preferredCity",
      kind: "select",
      required: false,
      source: "cities",
    },
    {
      key: "preferredAreaIds",
      labelKey: "requirements.fields.preferredAreas",
      kind: "multiselect",
      required: false,
      source: "areas",
      dependsOn: "preferredCityId",
      hint: "Areas inside the preferred city; empty means the whole city.",
    },
    {
      key: "facilityIds",
      labelKey: "requirements.fields.facilities",
      kind: "multiselect",
      required: false,
      source: "facilities",
    },
    {
      key: "notes",
      labelKey: "requirements.fields.notes",
      kind: "textarea",
      required: false,
      placeholderKey: "requirements.notesPlaceholder",
    },
  ],
  toPayload: (values) => ({
    contactId: getText(values, "contactId"),
    propertyTypeId: getNullableText(values, "propertyTypeId"),
    purpose: getText(values, "purpose") as TRequirementPurpose,
    budgetMin: getNullableNumber(values, "budgetMin"),
    budgetMax: getNullableNumber(values, "budgetMax"),
    preferredCityId: getNullableText(values, "preferredCityId"),
    preferredAreaIds: getList(values, "preferredAreaIds"),
    facilityIds: getList(values, "facilityIds"),
    notes: getNullableText(values, "notes"),
    requirementStatus: "open",
    status: true,
  }),
  submit: async (payload) => {
    const requirement = await createPropertyRequirement(payload);
    return { id: requirement.id, label: requirement.contactName };
  },
  invalidates: [propertyRequirementKeys.all],
};

import { propertyKeys } from "@/features/properties/api/property-keys";
import { createProperty } from "@/features/properties/api/properties.api";
import { propertySchema } from "@/features/properties/schemas/property-schema";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import {
  getList,
  getNullableNumber,
  getNullableText,
  getText,
} from "@/features/voice-assistant/forms/form-values";
import type { IPropertyPayload, TPropertyPurpose } from "@/types/property";
import type { IAssistantFormDef } from "@/types/voice-assistant";

export const propertyForm: IAssistantFormDef<IPropertyPayload> = {
  type: "property",
  titleKey: "assistant.forms.property",
  errorsKey: "properties.errors",
  listPath: "/properties",
  schema: propertySchema,
  defaults: {
    title: "",
    purpose: "",
    propertyTypeId: "",
    price: "",
    cityId: "",
    areaId: "",
    ownerContactId: "",
    areaSqft: "",
    securityDeposit: "",
    floor: "",
    facilityIds: [],
    address: "",
    description: "",
  },
  fields: [
    {
      key: "title",
      labelKey: "properties.fields.title",
      kind: "text",
      required: true,
      placeholderKey: "properties.titlePlaceholder",
      hint: "A short listing title, 3-200 characters, e.g. 'Corner shop on main boulevard'.",
    },
    {
      key: "purpose",
      labelKey: "properties.fields.purpose",
      kind: "select",
      required: true,
      source: "propertyPurposes",
      hint: "For sale or for rent.",
    },
    {
      key: "propertyTypeId",
      labelKey: "properties.fields.propertyType",
      kind: "select",
      required: true,
      source: "propertyTypes",
      placeholderKey: "properties.selectType",
    },
    {
      key: "price",
      labelKey: "properties.fields.price",
      kind: "amount",
      required: true,
      hint: "Whole rupees. The sale price, or the monthly rent when the purpose is rent.",
    },
    {
      key: "cityId",
      labelKey: "properties.fields.city",
      kind: "select",
      required: true,
      source: "cities",
      placeholderKey: "properties.selectCity",
    },
    {
      key: "areaId",
      labelKey: "properties.fields.areaName",
      kind: "select",
      required: false,
      source: "areas",
      dependsOn: "cityId",
      hint: "An area or locality inside the chosen city.",
    },
    {
      key: "ownerContactId",
      labelKey: "properties.fields.owner",
      kind: "select",
      required: false,
      source: "contacts",
      createWith: "contact",
      hint: "The owner, an existing contact. Search by name or phone; offer to create a new contact if not found.",
    },
    {
      key: "areaSqft",
      labelKey: "properties.fields.areaSqft",
      kind: "number",
      required: false,
      hint: "Whole square feet. 1 marla is 225 sq ft and 1 kanal is 4500 sq ft.",
    },
    {
      key: "securityDeposit",
      labelKey: "properties.fields.securityDeposit",
      kind: "amount",
      required: false,
      isVisible: (values) => getText(values, "purpose") === "rent",
    },
    { key: "floor", labelKey: "properties.fields.floor", kind: "text", required: false },
    {
      key: "facilityIds",
      labelKey: "properties.fields.facilities",
      kind: "multiselect",
      required: false,
      source: "facilities",
      hint: "Several facilities can be picked, e.g. 3 bedrooms, furnished, parking.",
    },
    { key: "address", labelKey: "properties.fields.address", kind: "text", required: false },
    {
      key: "description",
      labelKey: "properties.fields.description",
      kind: "textarea",
      required: false,
    },
  ],
  toPayload: (values) => {
    const purpose = getText(values, "purpose") as TPropertyPurpose;

    return {
      propertyTypeId: getText(values, "propertyTypeId"),
      ownerContactId: getNullableText(values, "ownerContactId"),
      title: getText(values, "title").trim(),
      description: getNullableText(values, "description"),
      purpose,
      price: getNullableNumber(values, "price") ?? Number.NaN,
      securityDeposit: purpose === "rent" ? getNullableNumber(values, "securityDeposit") : null,
      areaSqft: getNullableNumber(values, "areaSqft"),
      facilityIds: getList(values, "facilityIds"),
      floor: getNullableText(values, "floor"),
      cityId: getText(values, "cityId"),
      areaId: getNullableText(values, "areaId"),
      address: getNullableText(values, "address"),
      propertyStatus: "available",
      status: true,
    };
  },
  submit: async (payload) => {
    const property = await createProperty(payload);
    return { id: property.id, label: property.title };
  },
  invalidates: [propertyKeys.all, propertyRequirementKeys.all],
};

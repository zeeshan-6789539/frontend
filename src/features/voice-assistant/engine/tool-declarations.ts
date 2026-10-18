import type { FunctionDeclaration } from "@google/genai";
import type { TAssistantFormType } from "@/types/voice-assistant";

const SEARCH_MODULES = ["properties", "propertyTypes", "tenants", "leases", "payments"] as const;

const fieldInputSchema = {
  type: "object",
  properties: {
    field: { type: "string", description: "Field key from the form report, e.g. 'name' or 'tenantId'." },
    value: {
      type: "string",
      description:
        "What the user said for this field. For dropdowns pass the spoken option name (not an id). For amounts pass rupees as digits, e.g. 150000 for 1.5 lakh. For dates pass YYYY-MM-DD. Pass 'none' to clear.",
    },
  },
  required: ["field"],
};

export const buildNavigationTool = (pages: readonly string[]): FunctionDeclaration => ({
  name: "navigate",
  description: "Open a page of the app.",
  parametersJsonSchema: {
    type: "object",
    properties: { page: { type: "string", enum: [...pages] } },
    required: ["page"],
  },
});

export const buildRecordTools = (
  forms: readonly TAssistantFormType[],
): FunctionDeclaration[] => [
  {
    name: "searchRecords",
    description:
      "Search the company's properties, property types, tenants, leases or payments and show the results on screen. Summarise at most three results aloud.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        module: { type: "string", enum: [...SEARCH_MODULES] },
        query: { type: "string", description: "Words to search for; empty lists the newest records." },
      },
      required: ["module"],
    },
  },
  {
    name: "startForm",
    description:
      "Open a guided form to add a new record. Replaces any form already open. Returns a report with the next field to ask about.",
    parametersJsonSchema: {
      type: "object",
      properties: { form: { type: "string", enum: [...forms] } },
      required: ["form"],
    },
  },
  {
    name: "fillFields",
    description:
      "Fill one or more fields of the open form from what the user said. Pass every detail the user gave in one call. Returns problems (ambiguous or not-found options, invalid values) and the next field to ask about.",
    parametersJsonSchema: {
      type: "object",
      properties: { fields: { type: "array", items: fieldInputSchema } },
      required: ["fields"],
    },
  },
  {
    name: "getFieldOptions",
    description: "List the options of a dropdown field, optionally filtered by a search term, to read them to the user.",
    parametersJsonSchema: {
      type: "object",
      properties: { field: { type: "string" }, search: { type: "string" } },
      required: ["field"],
    },
  },
  {
    name: "focusField",
    description: "Highlight a field on screen when the user wants to go back to it or change it.",
    parametersJsonSchema: {
      type: "object",
      properties: { field: { type: "string" } },
      required: ["field"],
    },
  },
  {
    name: "startNestedForm",
    description:
      "When a dropdown option does not exist yet (e.g. a new tenant for a lease), open the form that creates it. After it is saved, the parent form continues with the new record selected.",
    parametersJsonSchema: {
      type: "object",
      properties: { field: { type: "string", description: "The parent field that needs the new record." } },
      required: ["field"],
    },
  },
  {
    name: "reviewForm",
    description: "Show the summary card once the user has no more details to add. Fails if required fields are missing.",
    parametersJsonSchema: { type: "object", properties: {} },
  },
  {
    name: "submitForm",
    description: "Save the reviewed form. Call ONLY after the summary was shown and the user clearly confirmed.",
    parametersJsonSchema: { type: "object", properties: {} },
  },
  {
    name: "cancelForm",
    description: "Discard the open form when the user wants to stop.",
    parametersJsonSchema: { type: "object", properties: {} },
  },
  {
    name: "renamePropertyType",
    description:
      "Rename one of the company's property types. Every property using it shows the new name. Call ONLY after repeating the change and getting a clear yes.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The type's current name as the user said it." },
        newName: { type: "string", description: "The new name, 2-100 characters." },
      },
      required: ["name", "newName"],
    },
  },
  {
    name: "setPropertyTypeStatus",
    description:
      "Deactivate a property type (hides it from the property form; properties already using it keep it) or reactivate it. Call ONLY after repeating the change and getting a clear yes.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The type's name as the user said it." },
        active: { type: "boolean", description: "true to reactivate, false to deactivate." },
      },
      required: ["name", "active"],
    },
  },
];

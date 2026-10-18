import { leaseKeys } from "@/features/leases/api/lease-keys";
import { createLease } from "@/features/leases/api/leases.api";
import { createLeaseSchema } from "@/features/leases/schemas/lease-schema";
import { getOptionalText, getText } from "@/features/voice-assistant/forms/form-values";
import { buildLeaseLabel } from "@/utils/lease";
import type { ICreateLeasePayload } from "@/types/lease";
import type { IAssistantFormDef } from "@/types/voice-assistant";

export const leaseForm: IAssistantFormDef<ICreateLeasePayload> = {
  type: "lease",
  titleKey: "assistant.forms.lease",
  errorsKey: "leases.errors",
  listPath: "/leases",
  schema: createLeaseSchema,
  defaults: {
    propertyId: "",
    tenantId: "",
    startDate: "",
    endDate: "",
    monthlyRent: "",
    advanceAmount: "",
    documentUrl: "",
  },
  fields: [
    {
      key: "propertyId",
      labelKey: "leases.fields.property",
      kind: "select",
      required: true,
      source: "properties",
      createWith: "property",
      placeholderKey: "leases.selectProperty",
      hint: "The property being rented out. Search by its name or number; offer to create a new property if not found.",
    },
    {
      key: "tenantId",
      labelKey: "leases.fields.tenant",
      kind: "select",
      required: true,
      source: "tenants",
      createWith: "tenant",
      placeholderKey: "leases.selectTenant",
      hint: "The tenant renting it. Search by name; offer to create a new tenant if not found.",
    },
    {
      key: "startDate",
      labelKey: "leases.fields.startDate",
      kind: "date",
      required: true,
      hint: "The date the lease starts, as YYYY-MM-DD.",
    },
    {
      key: "endDate",
      labelKey: "leases.fields.endDate",
      kind: "date",
      required: true,
      hint: "The date the lease ends, after the start date, as YYYY-MM-DD. 'One year' means one year after the start date.",
    },
    {
      key: "monthlyRent",
      labelKey: "leases.fields.monthlyRent",
      kind: "amount",
      required: true,
      hint: "The monthly rent in rupees.",
    },
    {
      key: "advanceAmount",
      labelKey: "leases.fields.advanceAmount",
      kind: "amount",
      required: false,
      hint: "The advance or security deposit paid up front, in rupees.",
    },
    {
      key: "documentUrl",
      labelKey: "leases.fields.documentUrl",
      kind: "url",
      required: false,
      placeholderKey: "leases.documentUrlPlaceholder",
      hint: "A link to the signed agreement starting with https://. Usually typed rather than spoken.",
    },
  ],
  toPayload: (values) => ({
    propertyId: getText(values, "propertyId"),
    tenantId: getText(values, "tenantId"),
    startDate: getText(values, "startDate"),
    endDate: getText(values, "endDate"),
    monthlyRent: getText(values, "monthlyRent").trim(),
    advanceAmount: getOptionalText(values, "advanceAmount"),
    documentUrl: getOptionalText(values, "documentUrl"),
  }),
  submit: async (payload) => {
    const lease = await createLease(payload);
    return { id: lease.id, label: buildLeaseLabel(lease) };
  },
  invalidates: [leaseKeys.all],
};

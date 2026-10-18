import { PHONE_PLACEHOLDER } from "@/config/phone";
import { tenantKeys } from "@/features/tenants/api/tenant-keys";
import { createTenant } from "@/features/tenants/api/tenants.api";
import { tenantSchema } from "@/features/tenants/schemas/tenant-schema";
import { getOptionalText, getText } from "@/features/voice-assistant/forms/form-values";
import type { ITenantPayload } from "@/types/tenant";
import type { IAssistantFormDef } from "@/types/voice-assistant";

export const tenantForm: IAssistantFormDef<ITenantPayload> = {
  type: "tenant",
  titleKey: "assistant.forms.tenant",
  errorsKey: "tenants.errors",
  listPath: "/tenants",
  schema: tenantSchema,
  defaults: { name: "", phone: "", email: "" },
  fields: [
    {
      key: "name",
      labelKey: "tenants.fields.name",
      kind: "text",
      required: true,
      hint: "The tenant's full name.",
    },
    {
      key: "phone",
      labelKey: "tenants.fields.phone",
      kind: "phone",
      required: false,
      hint: `Pakistani mobile number, 11 digits like ${PHONE_PLACEHOLDER}. Read it back digit by digit to confirm.`,
    },
    { key: "email", labelKey: "tenants.fields.email", kind: "email", required: false },
  ],
  toPayload: (values) => ({
    name: getText(values, "name").trim(),
    email: getOptionalText(values, "email"),
    phone: getOptionalText(values, "phone"),
    status: true,
  }),
  submit: async (payload) => {
    const tenant = await createTenant(payload);
    return { id: tenant.id, label: tenant.name };
  },
  invalidates: [tenantKeys.all],
};

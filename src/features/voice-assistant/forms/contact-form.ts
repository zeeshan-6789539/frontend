import { PHONE_PLACEHOLDER } from "@/config/phone";
import { contactKeys } from "@/features/contacts/api/contact-keys";
import { createContact } from "@/features/contacts/api/contacts.api";
import { contactSchema } from "@/features/contacts/schemas/contact-schema";
import { getNullableText, getText } from "@/features/voice-assistant/forms/form-values";
import type { IContactPayload } from "@/types/contact";
import type { IAssistantFormDef } from "@/types/voice-assistant";

export const contactForm: IAssistantFormDef<IContactPayload> = {
  type: "contact",
  titleKey: "assistant.forms.contact",
  errorsKey: "contacts.errors",
  listPath: "/contacts",
  schema: contactSchema,
  defaults: { name: "", phone: "", email: "", cnic: "", address: "", notes: "" },
  fields: [
    {
      key: "name",
      labelKey: "contacts.fields.name",
      kind: "text",
      required: true,
      hint: "The person's full name.",
    },
    {
      key: "phone",
      labelKey: "contacts.fields.phone",
      kind: "phone",
      required: true,
      hint: `Pakistani mobile number, 11 digits like ${PHONE_PLACEHOLDER}. Read it back digit by digit to confirm.`,
    },
    { key: "email", labelKey: "contacts.fields.email", kind: "email", required: false },
    {
      key: "cnic",
      labelKey: "contacts.fields.cnic",
      kind: "text",
      required: false,
      placeholderKey: "contacts.cnicPlaceholder",
      hint: "13 digits, formatted like 35202-1234567-1.",
    },
    { key: "address", labelKey: "contacts.fields.address", kind: "text", required: false },
    { key: "notes", labelKey: "contacts.fields.notes", kind: "textarea", required: false },
  ],
  toPayload: (values) => ({
    name: getText(values, "name").trim(),
    phone: getText(values, "phone").trim(),
    email: getNullableText(values, "email"),
    cnic: getNullableText(values, "cnic"),
    address: getNullableText(values, "address"),
    notes: getNullableText(values, "notes"),
    status: true,
  }),
  submit: async (payload) => {
    const contact = await createContact(payload);
    return { id: contact.id, label: `${contact.name} · ${contact.phone}` };
  },
  invalidates: [contactKeys.all],
};

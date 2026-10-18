import { ledgerKeys } from "@/features/ledger/api/ledger-keys";
import { leaseKeys } from "@/features/leases/api/lease-keys";
import { paymentKeys } from "@/features/payments/api/payment-keys";
import { createPayment } from "@/features/payments/api/payments.api";
import { paymentSchema } from "@/features/payments/schemas/payment-schema";
import { getOptionalText, getText } from "@/features/voice-assistant/forms/form-values";
import type { ICreatePaymentPayload, TPaymentMethod } from "@/types/payment";
import type { IAssistantFormDef, TAssistantValues } from "@/types/voice-assistant";

const usesBank = (values: TAssistantValues): boolean => {
  const method = getText(values, "paymentMethod");
  return method === "cheque" || method === "bank_transfer";
};

const isCheque = (values: TAssistantValues): boolean => getText(values, "paymentMethod") === "cheque";

export const paymentForm: IAssistantFormDef<ICreatePaymentPayload> = {
  type: "payment",
  titleKey: "assistant.forms.payment",
  errorsKey: "payments.errors",
  listPath: "/payments",
  schema: paymentSchema,
  // Cash is preselected, as in the payment dialog
  defaults: {
    leaseId: "",
    amountPaid: "",
    paymentDate: "",
    paymentMethod: "cash",
    referenceNumber: "",
    receiptNumber: "",
    bankName: "",
    chequeClearanceDate: "",
    notes: "",
  },
  fields: [
    {
      key: "leaseId",
      labelKey: "payments.fields.lease",
      kind: "select",
      required: true,
      source: "leases",
      createWith: "lease",
      placeholderKey: "payments.selectLease",
      hint: "The active lease being paid, named by property number, property and tenant. Search by tenant or property name.",
    },
    {
      key: "amountPaid",
      labelKey: "payments.fields.amountPaid",
      kind: "amount",
      required: true,
      hint: "The amount received in rupees.",
    },
    {
      key: "paymentDate",
      labelKey: "payments.fields.paymentDate",
      kind: "date",
      required: true,
      hint: "The date the money was received, as YYYY-MM-DD; usually today. It cannot be in the future.",
    },
    {
      key: "paymentMethod",
      labelKey: "payments.fields.paymentMethod",
      kind: "select",
      required: true,
      source: "paymentMethods",
      hint: "Cash, bank transfer, cheque or online. Cash is preselected; mention it and change it if the user says otherwise.",
    },
    {
      key: "referenceNumber",
      labelKey: "payments.fields.referenceNumber",
      kind: "text",
      required: false,
    },
    {
      key: "receiptNumber",
      labelKey: "payments.fields.receiptNumber",
      kind: "text",
      required: false,
    },
    {
      key: "bankName",
      labelKey: "payments.fields.bankName",
      kind: "text",
      required: false,
      isVisible: usesBank,
    },
    {
      key: "chequeClearanceDate",
      labelKey: "payments.fields.chequeClearanceDate",
      kind: "date",
      required: false,
      isVisible: isCheque,
      hint: "The date the cheque cleared, as YYYY-MM-DD.",
    },
    { key: "notes", labelKey: "payments.fields.notes", kind: "textarea", required: false },
  ],
  toPayload: (values) => ({
    leaseId: getText(values, "leaseId"),
    amountPaid: getText(values, "amountPaid").trim(),
    paymentDate: getText(values, "paymentDate"),
    paymentMethod: getText(values, "paymentMethod") as TPaymentMethod,
    receiptNumber: getOptionalText(values, "receiptNumber"),
    referenceNumber: getOptionalText(values, "referenceNumber"),
    bankName: usesBank(values) ? getOptionalText(values, "bankName") : undefined,
    chequeClearanceDate: isCheque(values) ? getOptionalText(values, "chequeClearanceDate") : undefined,
    notes: getOptionalText(values, "notes"),
  }),
  submit: async (payload) => {
    const payment = await createPayment(payload);
    return { id: payment.id, label: `${payment.tenantName} · ${payment.amountPaid}` };
  },
  // A payment changes the lease's outstanding balance and its ledger statement
  invalidates: [paymentKeys.all, leaseKeys.all, ledgerKeys.all],
};

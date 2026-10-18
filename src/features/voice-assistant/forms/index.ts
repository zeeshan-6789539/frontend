import { leaseForm } from "@/features/voice-assistant/forms/lease-form";
import { paymentForm } from "@/features/voice-assistant/forms/payment-form";
import { propertyForm } from "@/features/voice-assistant/forms/property-form";
import { tenantForm } from "@/features/voice-assistant/forms/tenant-form";
import type { IAssistantFormDef, TAssistantFormType } from "@/types/voice-assistant";

export const assistantForms: Record<TAssistantFormType, IAssistantFormDef> = {
  property: propertyForm,
  tenant: tenantForm,
  lease: leaseForm,
  payment: paymentForm,
};

export const ASSISTANT_FORM_TYPES = Object.keys(assistantForms) as TAssistantFormType[];

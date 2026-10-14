import { contactForm } from "@/features/voice-assistant/forms/contact-form";
import {
  areaForm,
  cityForm,
  facilityForm,
  propertyTypeForm,
} from "@/features/voice-assistant/forms/lookup-forms";
import { propertyForm } from "@/features/voice-assistant/forms/property-form";
import { requirementForm } from "@/features/voice-assistant/forms/requirement-form";
import type { IAssistantFormDef, TAssistantFormType } from "@/types/voice-assistant";

export const assistantForms: Record<TAssistantFormType, IAssistantFormDef> = {
  property: propertyForm,
  requirement: requirementForm,
  contact: contactForm,
  city: cityForm,
  area: areaForm,
  propertyType: propertyTypeForm,
  facility: facilityForm,
};

export const ASSISTANT_FORM_TYPES = Object.keys(assistantForms) as TAssistantFormType[];

"use client";

import { useTranslations } from "next-intl";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getText } from "@/features/voice-assistant/forms/form-values";
import { useFieldOptions } from "@/features/voice-assistant/hooks/use-field-options";
import { useVoiceAssistant } from "@/features/voice-assistant/hooks/use-voice-assistant";
import type { IAssistantFieldControlProps } from "@/features/voice-assistant/types/voice-assistant-components";
import type { TAssistantFieldKind } from "@/types/voice-assistant";

const INPUT_TYPES = {
  email: "email",
  phone: "tel",
  url: "url",
  amount: "text",
  number: "text",
  text: "text",
} as const;

const INPUT_MODES: Partial<Record<TAssistantFieldKind, "decimal" | "numeric" | "tel" | "url">> = {
  amount: "decimal",
  number: "numeric",
  phone: "tel",
  url: "url",
};

export const AssistantFieldControl = ({ form, field }: IAssistantFieldControlProps) => {
  const t = useTranslations();
  const { setFieldValue, commitField } = useVoiceAssistant();
  const { options, isPending } = useFieldOptions(field, form);
  const id = `${form.id}-${field.key}`;
  const hasError = form.errors[field.key] !== undefined;
  const placeholder = field.placeholderKey ? t(field.placeholderKey) : undefined;

  if (field.kind === "select") {
    return (
      <Select
        id={id}
        options={options}
        value={getText(form.values, field.key)}
        hasError={hasError}
        placeholder={isPending ? t("common.loading") : (placeholder ?? t("assistant.form.choose"))}
        onChange={(value) => {
          setFieldValue(field.key, value, options.find((option) => option.value === value)?.label);
          commitField(field.key);
        }}
      />
    );
  }

  if (field.kind === "date") {
    return (
      <DatePicker
        id={id}
        value={getText(form.values, field.key)}
        hasError={hasError}
        onChange={(value) => {
          setFieldValue(field.key, value);
          commitField(field.key);
        }}
      />
    );
  }

  if (field.kind === "textarea") {
    return (
      <Textarea
        id={id}
        value={getText(form.values, field.key)}
        hasError={hasError}
        placeholder={placeholder}
        onChange={(event) => setFieldValue(field.key, event.target.value)}
        onBlur={() => commitField(field.key)}
      />
    );
  }

  return (
    <Input
      id={id}
      type={INPUT_TYPES[field.kind]}
      inputMode={INPUT_MODES[field.kind]}
      value={getText(form.values, field.key)}
      hasError={hasError}
      placeholder={placeholder}
      onChange={(event) => setFieldValue(field.key, event.target.value)}
      onBlur={() => commitField(field.key)}
      onKeyDown={(event) => {
        if (event.key === "Enter") commitField(field.key);
      }}
    />
  );
};

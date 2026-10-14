"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getList, getText } from "@/features/voice-assistant/forms/form-values";
import { useFieldOptions } from "@/features/voice-assistant/hooks/use-field-options";
import { useVoiceAssistant } from "@/features/voice-assistant/hooks/use-voice-assistant";
import type { IAssistantFieldControlProps } from "@/types/voice-assistant";

const INPUT_TYPES = { email: "email", phone: "tel", amount: "text", number: "text", text: "text" } as const;

export const AssistantFieldControl = ({ form, field }: IAssistantFieldControlProps) => {
  const t = useTranslations();
  const { setFieldValue, commitField } = useVoiceAssistant();
  const { options, isPending, isWaitingForParent } = useFieldOptions(field, form);
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
        disabled={isWaitingForParent}
        placeholder={
          isWaitingForParent
            ? t("assistant.form.chooseParentFirst")
            : isPending
              ? t("common.loading")
              : (placeholder ?? t("assistant.form.choose"))
        }
        onChange={(value) => {
          setFieldValue(field.key, value, options.find((option) => option.value === value)?.label);
          commitField(field.key);
        }}
      />
    );
  }

  if (field.kind === "multiselect") {
    return (
      <MultiSelect
        id={id}
        options={options}
        values={getList(form.values, field.key)}
        hasError={hasError}
        disabled={isWaitingForParent}
        placeholder={isWaitingForParent ? t("assistant.form.chooseParentFirst") : t("assistant.form.chooseMany")}
        onChange={(values) =>
          setFieldValue(
            field.key,
            values,
            options
              .filter((option) => values.includes(option.value))
              .map((option) => option.label)
              .join(", "),
          )
        }
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
      inputMode={field.kind === "amount" || field.kind === "number" ? "numeric" : undefined}
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

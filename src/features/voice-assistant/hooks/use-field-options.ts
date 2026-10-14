"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ASSISTANT_OPTIONS_QUERY_KEY } from "@/config/assistant";
import { getText } from "@/features/voice-assistant/forms/form-values";
import { loadFieldOptions } from "@/features/voice-assistant/engine/form-engine";
import { useVoiceAssistant } from "@/features/voice-assistant/hooks/use-voice-assistant";
import { withMissingOptions } from "@/utils/options";
import type { ISelectOption } from "@/types/ui";
import type { IAssistantFieldDef, IAssistantFormState } from "@/types/voice-assistant";

// Options for one dropdown; the chosen value stays listed even when it fell outside the loaded page
export const useFieldOptions = (field: IAssistantFieldDef, form: IAssistantFormState) => {
  const { engineContext } = useVoiceAssistant();
  const dependencyValue = field.dependsOn ? getText(form.values, field.dependsOn) : "";
  const isWaitingForParent = field.dependsOn !== undefined && dependencyValue === "";

  const { data, isPending } = useQuery({
    queryKey: [...ASSISTANT_OPTIONS_QUERY_KEY, field.source, dependencyValue],
    queryFn: () => loadFieldOptions(field, form, engineContext),
    enabled: field.source !== undefined && !isWaitingForParent,
  });

  return useMemo(() => {
    const value = form.values[field.key];
    const chosenIds = Array.isArray(value) ? value : value ? [value] : [];
    const chosenLabels = form.labels[field.key]?.split(", ") ?? [];
    const extras: ISelectOption[] = chosenIds.map((id, index) => ({
      value: id,
      label: chosenLabels[index] ?? chosenLabels[0] ?? id,
    }));

    return {
      options: withMissingOptions(data ?? [], extras),
      isPending: isPending && !isWaitingForParent,
      isWaitingForParent,
    };
  }, [data, field.key, form.labels, form.values, isPending, isWaitingForParent]);
};

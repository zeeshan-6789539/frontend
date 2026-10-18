"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ASSISTANT_OPTIONS_QUERY_KEY } from "@/config/assistant";
import { loadFieldOptions } from "@/features/voice-assistant/engine/form-engine";
import { useVoiceAssistant } from "@/features/voice-assistant/hooks/use-voice-assistant";
import { withMissingOptions } from "@/utils/options";
import type { IAssistantFieldDef, IAssistantFormState } from "@/types/voice-assistant";

// Options for one dropdown; the chosen value stays listed even when it fell outside the loaded page
export const useFieldOptions = (field: IAssistantFieldDef, form: IAssistantFormState) => {
  const { engineContext } = useVoiceAssistant();

  const { data, isPending } = useQuery({
    queryKey: [...ASSISTANT_OPTIONS_QUERY_KEY, field.source],
    queryFn: () => loadFieldOptions(field, engineContext),
    enabled: field.source !== undefined,
  });

  return useMemo(() => {
    const value = form.values[field.key] ?? "";
    const label = form.labels[field.key];
    const extras = value !== "" ? [{ value, label: label ?? value }] : [];

    return { options: withMissingOptions(data ?? [], extras), isPending };
  }, [data, field.key, form.labels, form.values, isPending]);
};

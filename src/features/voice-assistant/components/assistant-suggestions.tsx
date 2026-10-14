"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useVoiceAssistant } from "@/features/voice-assistant/hooks/use-voice-assistant";
import type { TAssistantFormType } from "@/types/voice-assistant";

const FORM_SUGGESTIONS: readonly TAssistantFormType[] = ["property", "contact", "requirement"];

// While talking, a chip is said for the user; otherwise it opens the form to fill by hand or voice
export const AssistantSuggestions = () => {
  const t = useTranslations("assistant");
  const { isActive, canUseForms, sendText, startForm } = useVoiceAssistant();

  if (!canUseForms) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {FORM_SUGGESTIONS.map((type) => (
        <Button
          key={type}
          variant="soft"
          size="sm"
          onClick={() => (isActive ? sendText(t(`suggestions.${type}`)) : void startForm(type))}
        >
          {t(`suggestions.${type}`)}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={!isActive}
        onClick={() => sendText(t("suggestions.search"))}
      >
        {t("suggestions.search")}
      </Button>
    </div>
  );
};

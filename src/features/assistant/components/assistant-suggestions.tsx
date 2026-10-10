"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IAssistantSuggestionsProps } from "@/features/assistant/types/assistant-components";

const SUGGESTION_KEYS = ["summary", "owing", "endingLeases"] as const;

export const AssistantSuggestions = ({ isDisabled, onPick }: IAssistantSuggestionsProps) => {
  const t = useTranslations("assistant");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-2 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-brand">
        <Sparkles className="h-8 w-8" aria-hidden />
      </span>
      <div className="space-y-2">
        <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("emptyTitle")}</p>
        <p className="text-base text-muted-foreground">{t("emptyDescription")}</p>
      </div>
      <div className="grid w-full gap-3 sm:grid-cols-3">
        {SUGGESTION_KEYS.map((key) => (
          <Button
            key={key}
            variant="outline"
            disabled={isDisabled}
            onClick={() => onPick(t(`suggestions.${key}`))}
            className="h-auto min-h-20 items-start justify-start whitespace-normal rounded-2xl p-4 text-start text-sm"
          >
            {t(`suggestions.${key}`)}
          </Button>
        ))}
      </div>
    </div>
  );
};

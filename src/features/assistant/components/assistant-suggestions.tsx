"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IAssistantSuggestionsProps } from "@/features/assistant/types/assistant-components";

const SUGGESTION_KEYS = ["summary", "owing", "endingLeases"] as const;

export const AssistantSuggestions = ({ isDisabled, onPick }: IAssistantSuggestionsProps) => {
  const t = useTranslations("assistant");

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-2 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground">
        <Sparkles className="h-6 w-6" aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="font-medium">{t("emptyTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("emptyDescription")}</p>
      </div>
      <div className="flex w-full flex-col gap-2">
        {SUGGESTION_KEYS.map((key) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            disabled={isDisabled}
            onClick={() => onPick(t(`suggestions.${key}`))}
            className="h-auto justify-start whitespace-normal py-2 text-start"
          >
            {t(`suggestions.${key}`)}
          </Button>
        ))}
      </div>
    </div>
  );
};

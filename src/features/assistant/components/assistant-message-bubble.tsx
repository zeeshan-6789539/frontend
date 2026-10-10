"use client";

import { useTranslations } from "next-intl";
import { Sparkles, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IAssistantMessageBubbleProps } from "@/features/assistant/types/assistant-components";

export const AssistantMessageBubble = ({ message, onPlay }: IAssistantMessageBubbleProps) => {
  const t = useTranslations("assistant");
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="sr-only">{t("you")}</span>
        <p
          dir="auto"
          className="max-w-[80%] whitespace-pre-line rounded-3xl rounded-ee-md bg-primary px-5 py-3 text-base leading-relaxed text-primary-foreground"
        >
          {message.text}
        </p>
        {message.isFailed ? <span className="text-sm text-danger">{t("notSent")}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground">
        <Sparkles className="h-4 w-4" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="sr-only">{t("assistantLabel")}</span>
        <p dir="auto" className="whitespace-pre-line pt-1 text-base leading-7 text-foreground">
          {message.text}
        </p>
        {message.isFailed ? <span className="text-sm text-danger">{t("notSent")}</span> : null}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPlay(message.text)}
          aria-label={t("playReply")}
          title={t("playReply")}
          className="-ms-2 h-8 px-2"
        >
          <Volume2 className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
};

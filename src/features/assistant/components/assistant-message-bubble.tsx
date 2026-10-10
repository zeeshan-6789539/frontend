"use client";

import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { IAssistantMessageBubbleProps } from "@/features/assistant/types/assistant-components";

export const AssistantMessageBubble = ({ message, onPlay }: IAssistantMessageBubbleProps) => {
  const t = useTranslations("assistant");
  const isUser = message.role === "user";

  return (
    <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
      <span className="sr-only">{isUser ? t("you") : t("assistantLabel")}</span>
      <p
        dir="auto"
        className={cn(
          "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          isUser
            ? "rounded-ee-sm bg-primary text-primary-foreground"
            : "rounded-es-sm bg-muted text-foreground",
        )}
      >
        {message.text}
      </p>
      {message.isFailed ? <span className="text-xs text-danger">{t("notSent")}</span> : null}
      {isUser ? null : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPlay(message.text)}
          aria-label={t("playReply")}
          title={t("playReply")}
          className="h-7 px-2"
        >
          <Volume2 className="h-3.5 w-3.5" aria-hidden />
        </Button>
      )}
    </div>
  );
};

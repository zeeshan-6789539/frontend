"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";
import type { IAssistantMessageBubbleProps } from "@/features/assistant/types/assistant-components";

export const AssistantMessageBubble = ({ message }: IAssistantMessageBubbleProps) => {
  const t = useTranslations("assistant");
  const isUser = message.role === "user";

  return (
    <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
      <span className="sr-only">{isUser ? t("you") : t("assistantLabel")}</span>
      <p
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
    </div>
  );
};

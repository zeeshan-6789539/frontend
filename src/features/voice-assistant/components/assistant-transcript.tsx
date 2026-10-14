"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { AssistantSearchResults } from "@/features/voice-assistant/components/assistant-search-results";
import { AssistantSuggestions } from "@/features/voice-assistant/components/assistant-suggestions";
import { useVoiceAssistant } from "@/features/voice-assistant/hooks/use-voice-assistant";
import { cn } from "@/utils/cn";
import type { IAssistantTranscriptProps } from "@/types/voice-assistant";

export const AssistantTranscript = ({ className }: IAssistantTranscriptProps) => {
  const t = useTranslations("assistant");
  const { transcript } = useVoiceAssistant();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [transcript]);

  if (transcript.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4 text-center", className)}>
        <p className="text-sm text-muted-foreground">{t("transcriptEmptySubtitle")}</p>
        <AssistantSuggestions />
      </div>
    );
  }

  return (
    <div className={cn("space-y-3 overflow-y-auto", className)} aria-live="polite">
      {transcript.map((entry) => (
        <div
          key={entry.id}
          className={cn("flex", entry.speaker === "user" ? "justify-end" : "justify-start")}
        >
          <div
            className={cn(
              "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
              entry.speaker === "user" && "bg-primary text-primary-foreground",
              entry.speaker === "assistant" && "bg-muted text-foreground",
              entry.speaker === "system" && "w-full max-w-full border border-border bg-card",
              !entry.isFinal && "opacity-80",
            )}
          >
            <p className="mb-0.5 text-[11px] font-medium opacity-70">
              {entry.speaker === "user" ? t("you") : t("assistantName")}
            </p>
            <p className="whitespace-pre-wrap break-words">{entry.text}</p>
            {entry.results ? <AssistantSearchResults results={entry.results} /> : null}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

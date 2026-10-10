"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles, Square, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AssistantComposer } from "@/features/assistant/components/assistant-composer";
import { AssistantMessageBubble } from "@/features/assistant/components/assistant-message-bubble";
import { AssistantSuggestions } from "@/features/assistant/components/assistant-suggestions";
import { getApiErrorMessage } from "@/utils/api";
import type { IAssistantPanelProps } from "@/features/assistant/types/assistant-components";

export const AssistantPanel = ({
  messages,
  isPending,
  error,
  transcriptScript,
  isVoiceBusy,
  isVoicePreparing,
  isVoiceReplyOn,
  onSend,
  onPlay,
  onClear,
  onClose,
  onStopSpeaking,
  onToggleVoiceReply,
}: IAssistantPanelProps) => {
  const t = useTranslations("assistant");
  const tCommon = useTranslations("common");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length, isPending]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const voiceReplyLabel = isVoiceReplyOn ? t("voiceReplyOn") : t("voiceReplyOff");

  return (
    <section
      role="dialog"
      aria-labelledby="assistant-title"
      className="fixed inset-2 z-50 flex flex-col rounded-card border border-border bg-card shadow-lg sm:inset-auto sm:end-4 sm:bottom-4 sm:h-[min(40rem,calc(100dvh-2rem))] sm:w-100"
    >
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-brand">
          <Sparkles className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="assistant-title" className="truncate font-semibold tracking-tight">
            {t("title")}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {isVoicePreparing ? t("preparingVoice") : t("subtitle")}
          </p>
        </div>

        {isVoiceBusy ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onStopSpeaking}
            aria-label={t("stopSpeaking")}
            title={t("stopSpeaking")}
          >
            {isVoicePreparing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Square className="h-4 w-4" aria-hidden />
            )}
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleVoiceReply}
          aria-pressed={isVoiceReplyOn}
          aria-label={voiceReplyLabel}
          title={voiceReplyLabel}
        >
          {isVoiceReplyOn ? (
            <Volume2 className="h-4 w-4" aria-hidden />
          ) : (
            <VolumeX className="h-4 w-4" aria-hidden />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          disabled={messages.length === 0 || isPending}
          aria-label={t("clear")}
          title={t("clear")}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={tCommon("close")}>
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </header>

      <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && !isPending ? (
          <AssistantSuggestions isDisabled={isPending} onPick={(text) => onSend(text, false)} />
        ) : (
          messages.map((message) => (
            <AssistantMessageBubble key={message.id} message={message} onPlay={onPlay} />
          ))
        )}

        {isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {t("thinking")}
          </div>
        ) : null}

        {error && !isPending ? <Alert>{getApiErrorMessage(error, tCommon("error"))}</Alert> : null}
        <div ref={endRef} />
      </div>

      <AssistantComposer
        isPending={isPending}
        transcriptScript={transcriptScript}
        onSend={onSend}
        onListenStart={onStopSpeaking}
      />
    </section>
  );
};

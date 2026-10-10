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
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6">
      <div
        aria-hidden
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-title"
        className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden border-border bg-card shadow-2xl sm:rounded-card sm:border"
      >
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-brand">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="assistant-title" className="truncate text-lg font-semibold tracking-tight">
              {t("title")}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
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

        <div aria-live="polite" className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6">
            {messages.length === 0 && !isPending ? (
              <AssistantSuggestions isDisabled={isPending} onPick={(text) => onSend(text, false)} />
            ) : (
              messages.map((message) => (
                <AssistantMessageBubble key={message.id} message={message} onPlay={onPlay} />
              ))
            )}

            {isPending ? (
              <div className="flex items-center gap-3 text-base text-muted-foreground">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground">
                  <Sparkles className="h-4 w-4 animate-pulse" aria-hidden />
                </span>
                {t("thinking")}
              </div>
            ) : null}

            {error && !isPending ? (
              <Alert>{getApiErrorMessage(error, tCommon("error"))}</Alert>
            ) : null}
            <div ref={endRef} />
          </div>
        </div>

        <AssistantComposer
          isPending={isPending}
          transcriptScript={transcriptScript}
          onSend={onSend}
          onListenStart={onStopSpeaking}
        />
      </section>
    </div>
  );
};

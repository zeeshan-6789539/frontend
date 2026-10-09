"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Mic, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ASSISTANT_MESSAGE_MAX_LENGTH } from "@/config/assistant";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/utils/cn";
import type { IAssistantComposerProps } from "@/features/assistant/types/assistant-components";
import type { TSpeechRecognitionError } from "@/types/speech";

const MIC_ERROR_KEYS: Record<TSpeechRecognitionError, string> = {
  "not-allowed": "micErrors.notAllowed",
  "no-speech": "micErrors.noSpeech",
  other: "micErrors.other",
};

export const AssistantComposer = ({
  isPending,
  speechLang,
  onSend,
  onListenStart,
}: IAssistantComposerProps) => {
  const t = useTranslations("assistant");
  const [draft, setDraft] = useState("");
  const speech = useSpeechRecognition({
    lang: speechLang,
    onResult: (transcript) => onSend(transcript, true),
  });

  const submit = () => {
    if (!draft.trim() || isPending) return;

    onSend(draft, false);
    setDraft("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  // Enter sends, Shift+Enter keeps a new line
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    submit();
  };

  const toggleListening = () => {
    if (speech.isListening) {
      speech.stop();
      return;
    }

    onListenStart();
    speech.start();
  };

  const micLabel = !speech.isSupported
    ? t("micUnsupported")
    : speech.isListening
      ? t("stopListening")
      : t("startListening");

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border-t border-border px-4 py-3">
      {speech.isListening ? (
        <p aria-live="polite" className="truncate text-sm text-primary">
          {speech.interimTranscript || t("listening")}
        </p>
      ) : null}
      {speech.error ? (
        <p role="alert" className="text-xs text-danger">
          {t(MIC_ERROR_KEYS[speech.error])}
        </p>
      ) : null}

      <div className="flex items-end gap-2">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          maxLength={ASSISTANT_MESSAGE_MAX_LENGTH}
          rows={1}
          className="max-h-32 min-h-10 resize-none"
        />
        <Button
          type="button"
          variant={speech.isListening ? "danger" : "soft"}
          size="icon"
          onClick={toggleListening}
          disabled={!speech.isSupported || isPending}
          aria-label={micLabel}
          title={micLabel}
          className={cn("h-10 w-10 shrink-0", speech.isListening && "animate-pulse")}
        >
          {speech.isListening ? (
            <Square className="h-4 w-4" aria-hidden />
          ) : (
            <Mic className="h-4 w-4" aria-hidden />
          )}
        </Button>
        <Button
          type="submit"
          size="icon"
          disabled={!draft.trim() || isPending}
          aria-label={t("send")}
          title={t("send")}
          className="h-10 w-10 shrink-0"
        >
          <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        </Button>
      </div>
    </form>
  );
};

"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Mic, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ASSISTANT_MESSAGE_MAX_LENGTH } from "@/config/assistant";
import { useTranscribeSpeech } from "@/features/assistant/hooks/use-transcribe-speech";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { getApiErrorMessage } from "@/utils/api";
import { cn } from "@/utils/cn";
import type { IAssistantComposerProps } from "@/features/assistant/types/assistant-components";
import type { TAudioRecorderError } from "@/types/speech";

const MIC_ERROR_KEYS: Record<TAudioRecorderError, string> = {
  "not-allowed": "micErrors.notAllowed",
  "no-speech": "micErrors.noSpeech",
  other: "micErrors.other",
};

export const AssistantComposer = ({
  isPending,
  transcriptScript,
  onSend,
  onListenStart,
}: IAssistantComposerProps) => {
  const t = useTranslations("assistant");
  const tCommon = useTranslations("common");
  const [draft, setDraft] = useState("");
  const transcription = useTranscribeSpeech();
  const recorder = useAudioRecorder({
    onRecorded: ({ base64, mimeType }) =>
      transcription.mutate(
        { audioBase64: base64, mimeType, script: transcriptScript },
        { onSuccess: ({ transcript }) => onSend(transcript, true) },
      ),
  });
  const isTranscribing = transcription.isPending;
  const isBusy = isPending || isTranscribing;

  const submit = () => {
    if (!draft.trim() || isBusy) return;

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

  const toggleRecording = () => {
    if (recorder.isRecording) {
      recorder.stop();
      return;
    }

    transcription.reset();
    onListenStart();
    void recorder.start();
  };

  const micLabel = !recorder.isSupported
    ? t("micUnsupported")
    : recorder.isRecording
      ? t("stopListening")
      : t("startListening");

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border-t border-border px-4 py-3">
      {recorder.isRecording ? (
        <p aria-live="polite" className="text-sm text-primary">
          {t("listening")}
        </p>
      ) : null}
      {isTranscribing ? (
        <p aria-live="polite" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          {t("transcribing")}
        </p>
      ) : null}
      {recorder.error ? (
        <p role="alert" className="text-xs text-danger">
          {t(MIC_ERROR_KEYS[recorder.error])}
        </p>
      ) : null}
      {transcription.error ? (
        <p role="alert" className="text-xs text-danger">
          {getApiErrorMessage(transcription.error, tCommon("error"))}
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
          variant={recorder.isRecording ? "danger" : "soft"}
          size="icon"
          onClick={toggleRecording}
          disabled={!recorder.isSupported || isBusy}
          aria-label={micLabel}
          title={micLabel}
          className={cn("h-10 w-10 shrink-0", recorder.isRecording && "animate-pulse")}
        >
          {recorder.isRecording ? (
            <Square className="h-4 w-4" aria-hidden />
          ) : (
            <Mic className="h-4 w-4" aria-hidden />
          )}
        </Button>
        <Button
          type="submit"
          size="icon"
          disabled={!draft.trim() || isBusy}
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

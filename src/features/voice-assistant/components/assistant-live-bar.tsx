"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { AudioLines, Loader2, Mic, MicOff, SendHorizontal, X } from "lucide-react";
import { useVoiceAssistant } from "@/features/voice-assistant/hooks/use-voice-assistant";
import { cn } from "@/utils/cn";

const ICON_BUTTON =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50";

// One line like Gemini Live: type or talk, mute, and a single start / end button
export const AssistantLiveBar = () => {
  const t = useTranslations("assistant");
  const { status, isActive, isMuted, error, start, stop, toggleMute, sendText } = useVoiceAssistant();
  const [text, setText] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sendText(text)) setText("");
  };

  return (
    <div className="space-y-2">
      {error ? (
        <p role="alert" className="px-2 text-center text-xs text-danger">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-1.5 rounded-full border border-border bg-card/80 p-1.5 shadow-lg backdrop-blur"
      >
        <span className="sr-only" role="status" aria-live="polite">
          {t(`status.${status}`)}
        </span>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={!isActive}
          placeholder={isActive ? `${t(`status.${status}`)} ${t("composerPlaceholder")}` : t("composerInactive")}
          aria-label={t("composerPlaceholder")}
          className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />

        {isActive && text.trim() !== "" ? (
          <button type="submit" aria-label={t("send")} className={cn(ICON_BUTTON, "text-primary hover:bg-muted")}>
            <SendHorizontal className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
          </button>
        ) : null}

        {isActive ? (
          <>
            <button
              type="button"
              onClick={toggleMute}
              aria-pressed={isMuted}
              aria-label={isMuted ? t("unmute") : t("mute")}
              title={isMuted ? t("unmute") : t("mute")}
              className={cn(ICON_BUTTON, isMuted ? "bg-muted text-danger" : "text-foreground hover:bg-muted")}
            >
              {isMuted ? <MicOff className="h-5 w-5" aria-hidden /> : <Mic className="h-5 w-5" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={stop}
              aria-label={t("stop")}
              title={t("stop")}
              className={cn(ICON_BUTTON, "bg-danger text-danger-foreground hover:bg-danger/90")}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => void start()}
            disabled={status === "connecting"}
            aria-label={t("start")}
            title={t("start")}
            className={cn(ICON_BUTTON, "bg-primary text-primary-foreground shadow-brand hover:bg-primary-hover")}
          >
            {status === "connecting" ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <AudioLines className="h-5 w-5" aria-hidden />
            )}
          </button>
        )}
      </form>
    </div>
  );
};

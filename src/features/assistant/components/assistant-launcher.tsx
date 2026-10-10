"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPEECH_LANGUAGES, TRANSCRIPT_SCRIPTS } from "@/config/assistant";
import { AssistantPanel } from "@/features/assistant/components/assistant-panel";
import { useAssistantChat } from "@/features/assistant/hooks/use-assistant-chat";
import { useAssistantVoice } from "@/features/assistant/hooks/use-assistant-voice";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import type { TLocale } from "@/types/locale";

// The conversation lives here so closing the panel keeps it; only client admins can use /ai/chat
export const AssistantLauncher = () => {
  const t = useTranslations("assistant");
  const locale = useLocale() as TLocale;
  const { data: user } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceReplyOn, setIsVoiceReplyOn] = useState(true);
  const chat = useAssistantChat();
  const voice = useAssistantVoice(SPEECH_LANGUAGES[locale]);
  const { cancel } = voice;

  const close = useCallback(() => {
    cancel();
    setIsOpen(false);
  }, [cancel]);

  if (user?.role !== "client_admin") return null;

  // Spoken questions get spoken answers; typed ones stay silent unless replayed
  const send = (text: string, isVoice: boolean) => {
    chat.send(text, isVoice && isVoiceReplyOn ? voice.speak : undefined);
  };

  const toggleVoiceReply = () => {
    if (isVoiceReplyOn) cancel();
    setIsVoiceReplyOn((current) => !current);
  };

  const clear = () => {
    cancel();
    chat.clear();
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        aria-label={t("open")}
        title={t("open")}
        className="fixed end-4 bottom-4 z-40 h-12 w-12 rounded-full bg-brand-gradient p-0"
      >
        <Sparkles className="h-5 w-5" aria-hidden />
      </Button>
    );
  }

  return (
    <AssistantPanel
      messages={chat.messages}
      isPending={chat.isPending}
      error={chat.error}
      transcriptScript={TRANSCRIPT_SCRIPTS[locale]}
      isVoiceBusy={voice.isPreparing || voice.isPlaying}
      isVoicePreparing={voice.isPreparing}
      isVoiceReplyOn={isVoiceReplyOn}
      onSend={send}
      onPlay={voice.speak}
      onClear={clear}
      onClose={close}
      onStopSpeaking={cancel}
      onToggleVoiceReply={toggleVoiceReply}
    />
  );
};

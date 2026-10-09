"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPEECH_LANGUAGES } from "@/config/assistant";
import { AssistantPanel } from "@/features/assistant/components/assistant-panel";
import { useAssistantChat } from "@/features/assistant/hooks/use-assistant-chat";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import type { TLocale } from "@/types/locale";

// The conversation lives here so closing the panel keeps it; only client admins can use /ai/chat
export const AssistantLauncher = () => {
  const t = useTranslations("assistant");
  const locale = useLocale() as TLocale;
  const { data: user } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceReplyOn, setIsVoiceReplyOn] = useState(true);
  const chat = useAssistantChat();
  const synthesis = useSpeechSynthesis();
  const { cancel } = synthesis;
  const speechLang = SPEECH_LANGUAGES[locale];

  const close = useCallback(() => {
    cancel();
    setIsOpen(false);
  }, [cancel]);

  if (user?.role !== "client_admin") return null;

  // Spoken questions get spoken answers; typed ones stay silent
  const send = (text: string, isVoice: boolean) => {
    const shouldSpeak = isVoice && isVoiceReplyOn && synthesis.isSupported;

    chat.send(text, shouldSpeak ? (reply) => synthesis.speak(reply, speechLang) : undefined);
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
      speechLang={speechLang}
      canSpeak={synthesis.isSupported}
      isSpeaking={synthesis.isSpeaking}
      isVoiceReplyOn={isVoiceReplyOn}
      onSend={send}
      onClear={clear}
      onClose={close}
      onStopSpeaking={cancel}
      onToggleVoiceReply={toggleVoiceReply}
    />
  );
};

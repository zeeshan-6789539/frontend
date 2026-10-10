"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ASSISTANT_SPEECH_MAX_LENGTH } from "@/config/assistant";
import { synthesizeSpeech } from "@/features/assistant/api/assistant.api";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { base64ToBlob } from "@/utils/base64";
import { truncateAtSentence } from "@/utils/string";
import type { IUseAssistantVoiceResult } from "@/types/assistant";

// Gemini's Pakistani-Urdu voice first; the browser's own voice if that fails or is blocked
export const useAssistantVoice = (fallbackLang: string): IUseAssistantVoiceResult => {
  const fallback = useSpeechSynthesis();
  const { speak: speakWithBrowser, cancel: cancelBrowser } = fallback;
  const requestIdRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;

    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setIsPlaying(false);
  }, []);

  const cancel = useCallback(() => {
    requestIdRef.current += 1;
    setIsPreparing(false);
    stopAudio();
    cancelBrowser();
  }, [stopAudio, cancelBrowser]);

  const speak = useCallback(
    (text: string) => {
      cancel();

      const requestId = requestIdRef.current;
      const spokenText = truncateAtSentence(text, ASSISTANT_SPEECH_MAX_LENGTH);
      const isCurrent = () => requestIdRef.current === requestId;
      const useBrowserVoice = () => {
        if (!isCurrent()) return;

        setIsPreparing(false);
        stopAudio();
        speakWithBrowser(spokenText, fallbackLang);
      };

      setIsPreparing(true);

      synthesizeSpeech(spokenText)
        .then(({ audioBase64, mimeType }) => {
          if (!isCurrent()) return;

          const url = URL.createObjectURL(base64ToBlob(audioBase64, mimeType));
          const audio = new Audio(url);

          urlRef.current = url;
          audioRef.current = audio;
          audio.onended = () => {
            if (audioRef.current === audio) stopAudio();
          };
          audio.onerror = useBrowserVoice;

          setIsPreparing(false);
          setIsPlaying(true);
          return audio.play();
        })
        .catch(useBrowserVoice);
    },
    [cancel, stopAudio, speakWithBrowser, fallbackLang],
  );

  useEffect(() => () => cancel(), [cancel]);

  return {
    isPreparing,
    isPlaying: isPlaying || fallback.isSpeaking,
    speak,
    cancel,
  };
};

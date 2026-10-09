"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useIsHydrated } from "@/hooks/use-is-hydrated";
import { findSpeechVoice, isSpeechSynthesisSupported } from "@/utils/speech";
import type { IUseSpeechSynthesisResult } from "@/types/speech";

export const useSpeechSynthesis = (): IUseSpeechSynthesisResult => {
  const isHydrated = useIsHydrated();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const cancel = useCallback(() => {
    utteranceRef.current = null;
    setIsSpeaking(false);

    if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback(
    (text: string, lang: string) => {
      if (!isSpeechSynthesisSupported()) return;

      cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      // Cancelling fires "end" on the old utterance, so only the current one may flip the flag
      const finish = () => {
        if (utteranceRef.current !== utterance) return;

        utteranceRef.current = null;
        setIsSpeaking(false);
      };

      utterance.lang = lang;
      utterance.voice = findSpeechVoice(window.speechSynthesis.getVoices(), lang) ?? null;
      utterance.onend = finish;
      utterance.onerror = finish;

      utteranceRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [cancel],
  );

  useEffect(
    () => () => {
      if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
    },
    [],
  );

  return {
    isSupported: isHydrated && isSpeechSynthesisSupported(),
    isSpeaking,
    speak,
    cancel,
  };
};

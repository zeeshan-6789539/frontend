"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useIsHydrated } from "@/hooks/use-is-hydrated";
import { getSpeechRecognitionConstructor } from "@/utils/speech";
import type {
  ISpeechRecognition,
  IUseSpeechRecognitionOptions,
  IUseSpeechRecognitionResult,
  TSpeechRecognitionError,
} from "@/types/speech";

const toRecognitionError = (code: string): TSpeechRecognitionError => {
  if (code === "not-allowed" || code === "service-not-allowed") return "not-allowed";

  return code === "no-speech" ? "no-speech" : "other";
};

// One utterance per start(): the final transcript is delivered once the browser stops listening
export const useSpeechRecognition = ({
  lang,
  onResult,
}: IUseSpeechRecognitionOptions): IUseSpeechRecognitionResult => {
  const isHydrated = useIsHydrated();
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<TSpeechRecognitionError | null>(null);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(
    () => () => {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      recognition?.abort();
    },
    [],
  );

  const start = useCallback(() => {
    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) return;

    const previous = recognitionRef.current;
    recognitionRef.current = null;
    previous?.abort();

    const recognition = new Recognition();
    const isCurrent = () => recognitionRef.current === recognition;
    let finalTranscript = "";

    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      if (!isCurrent()) return;

      let interim = "";

      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index];

        if (result.isFinal) finalTranscript += result[0].transcript;
        else interim += result[0].transcript;
      }

      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (isCurrent() && event.error !== "aborted") setError(toRecognitionError(event.error));
    };

    recognition.onend = () => {
      if (!isCurrent()) return;

      recognitionRef.current = null;
      setIsListening(false);
      setInterimTranscript("");

      const transcript = finalTranscript.trim();

      if (transcript) onResultRef.current(transcript);
    };

    recognitionRef.current = recognition;
    setError(null);
    setIsListening(true);
    recognition.start();
  }, [lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return {
    isSupported: isHydrated && getSpeechRecognitionConstructor() !== null,
    isListening,
    interimTranscript,
    error,
    start,
    stop,
  };
};

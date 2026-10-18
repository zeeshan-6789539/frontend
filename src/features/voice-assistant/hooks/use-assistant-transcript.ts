"use client";

import { useCallback, useRef, useState } from "react";
import { ASSISTANT_TRANSCRIPT_LIMIT } from "@/config/assistant";
import type {
  IAssistantSearchResults,
  IAssistantTranscriptEntry,
  TAssistantSpeaker,
} from "@/types/voice-assistant";

// Live transcription arrives in fragments; each speaker's open entry grows until its turn ends
export const useAssistantTranscript = () => {
  const [transcript, setTranscript] = useState<IAssistantTranscriptEntry[]>([]);
  const openEntryRef = useRef<Partial<Record<TAssistantSpeaker, string>>>({});

  const finalize = useCallback((speaker?: TAssistantSpeaker) => {
    const ids = speaker
      ? [openEntryRef.current[speaker]]
      : Object.values(openEntryRef.current);

    if (speaker) delete openEntryRef.current[speaker];
    else openEntryRef.current = {};

    setTranscript((entries) =>
      entries.map((entry) => (ids.includes(entry.id) ? { ...entry, isFinal: true } : entry)),
    );
  }, []);

  const appendFragment = useCallback(
    (speaker: TAssistantSpeaker, text: string) => {
      if (text === "") return;

      // The other side has started talking, so the previous turn is over
      finalize(speaker === "user" ? "assistant" : "user");

      const openId = openEntryRef.current[speaker];

      if (openId) {
        setTranscript((entries) =>
          entries.map((entry) => (entry.id === openId ? { ...entry, text: entry.text + text } : entry)),
        );
        return;
      }

      const id = crypto.randomUUID();
      openEntryRef.current[speaker] = id;
      setTranscript((entries) =>
        [...entries, { id, speaker, text: text.trimStart(), isFinal: false }].slice(
          -ASSISTANT_TRANSCRIPT_LIMIT,
        ),
      );
    },
    [finalize],
  );

  const addEntry = useCallback(
    (speaker: TAssistantSpeaker, text: string, results?: IAssistantSearchResults) => {
      finalize();
      setTranscript((entries) =>
        [...entries, { id: crypto.randomUUID(), speaker, text, isFinal: true, results }].slice(
          -ASSISTANT_TRANSCRIPT_LIMIT,
        ),
      );
    },
    [finalize],
  );

  const clear = useCallback(() => {
    openEntryRef.current = {};
    setTranscript([]);
  }, []);

  return { transcript, appendFragment, addEntry, finalize, clear };
};

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  GoogleGenAI,
  Modality,
  type FunctionCall,
  type FunctionResponse,
  type LiveServerMessage,
  type Session,
} from "@google/genai";
import {
  ASSISTANT_API_VERSION,
  ASSISTANT_INPUT_MIME_TYPE,
  ASSISTANT_LEVEL_STEPS,
} from "@/config/assistant";
import { createAssistantSession } from "@/features/voice-assistant/api/assistant.api";
import { startAudioCapture } from "@/features/voice-assistant/audio/audio-capture";
import { createAudioPlayer } from "@/features/voice-assistant/audio/audio-player";
import { getApiErrorMessage, isApiError } from "@/utils/api";
import type {
  IAudioCaptureHandle,
  IAudioPlayerHandle,
  ILiveSessionHandlers,
  TAssistantStatus,
} from "@/types/voice-assistant";

const METER_INTERVAL_MS = 100;
// Speech RMS rarely passes ~0.25, so it is stretched before quantising
const LEVEL_GAIN = 4;

export const useLiveSession = (handlers: ILiveSessionHandlers) => {
  const t = useTranslations("assistant");
  const [status, setStatus] = useState<TAssistantStatus>("idle");
  const [level, setLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlersRef = useRef(handlers);
  const sessionRef = useRef<Session | null>(null);
  const captureRef = useRef<IAudioCaptureHandle | null>(null);
  const playerRef = useRef<IAudioPlayerHandle | null>(null);
  const meterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const micLevelRef = useRef(0);
  const pendingToolsRef = useRef(0);
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const isMutedRef = useRef(false);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  const describeError = useCallback(
    (cause: unknown): string => {
      if (cause instanceof DOMException && cause.name === "NotAllowedError") return t("errors.micDenied");
      if (cause instanceof DOMException && cause.name === "NotFoundError") return t("errors.micMissing");
      if (isApiError(cause)) return getApiErrorMessage(cause, t("errors.connect"));
      return cause instanceof Error && cause.message ? cause.message : t("errors.connect");
    },
    [t],
  );

  const cleanup = useCallback(() => {
    if (meterRef.current) clearInterval(meterRef.current);
    meterRef.current = null;
    captureRef.current?.stop();
    captureRef.current = null;
    playerRef.current?.close();
    playerRef.current = null;
    const session = sessionRef.current;
    sessionRef.current = null;
    session?.close();
    pendingToolsRef.current = 0;
    micLevelRef.current = 0;
    setLevel(0);
    setStatus("idle");
  }, []);

  const runToolCalls = useCallback(async (calls: readonly FunctionCall[]) => {
    pendingToolsRef.current += 1;
    const functionResponses: FunctionResponse[] = [];

    for (const call of calls) {
      let response: Record<string, unknown>;

      try {
        response = await handlersRef.current.onToolCall(call);
      } catch (cause) {
        response = { ok: false, error: cause instanceof Error ? cause.message : String(cause) };
      }

      functionResponses.push({ id: call.id, name: call.name, response });
    }

    pendingToolsRef.current = Math.max(0, pendingToolsRef.current - 1);
    sessionRef.current?.sendToolResponse({ functionResponses });
  }, []);

  const handleMessage = useCallback(
    (message: LiveServerMessage) => {
      const content = message.serverContent;

      if (content?.interrupted) playerRef.current?.interrupt();

      content?.modelTurn?.parts?.forEach((part) => {
        if (part.inlineData?.data) playerRef.current?.enqueue(part.inlineData.data);
      });

      if (content?.inputTranscription?.text) {
        handlersRef.current.onFragment("user", content.inputTranscription.text);
      }
      if (content?.outputTranscription?.text) {
        handlersRef.current.onFragment("assistant", content.outputTranscription.text);
      }
      if (content?.turnComplete) handlersRef.current.onTurnComplete();

      if (message.toolCall?.functionCalls?.length) {
        void runToolCalls(message.toolCall.functionCalls);
      }
    },
    [runToolCalls],
  );

  const startMeter = useCallback(() => {
    meterRef.current = setInterval(() => {
      const player = playerRef.current;
      const raw = Math.max(micLevelRef.current, player?.getLevel() ?? 0);

      setLevel(Math.round(Math.min(1, raw * LEVEL_GAIN) * ASSISTANT_LEVEL_STEPS));

      if (player?.isPlaying()) setStatus("speaking");
      else if (pendingToolsRef.current > 0) setStatus("thinking");
      else setStatus("listening");
    }, METER_INTERVAL_MS);
  }, []);

  const start = useCallback(async () => {
    if (sessionRef.current || isStartingRef.current) return;

    isStartingRef.current = true;
    isStoppingRef.current = false;
    setError(null);
    setStatus("connecting");

    try {
      // Created inside the click handler so the browser lets it play audio
      playerRef.current = createAudioPlayer();

      const { token, model } = await createAssistantSession();
      const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: ASSISTANT_API_VERSION } });
      const { systemInstruction, functionDeclarations, greeting } = handlersRef.current.getSetup();

      sessionRef.current = await ai.live.connect({
        model,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction,
          tools: [{ functionDeclarations }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onmessage: handleMessage,
          onerror: () => setError(t("errors.connection")),
          onclose: (event) => {
            if (!isStoppingRef.current && sessionRef.current) {
              setError(event.reason ? t("errors.closedWithReason", { reason: event.reason }) : t("errors.closed"));
            }
            sessionRef.current = null;
            cleanup();
          },
        },
      });

      captureRef.current = await startAudioCapture({
        onChunk: (data) =>
          sessionRef.current?.sendRealtimeInput({ audio: { data, mimeType: ASSISTANT_INPUT_MIME_TYPE } }),
        onLevel: (value) => {
          micLevelRef.current = value;
        },
      });
      captureRef.current.setMuted(isMutedRef.current);

      setStatus("listening");
      startMeter();
      sessionRef.current?.sendRealtimeInput({ text: greeting });
    } catch (cause) {
      isStoppingRef.current = true;
      cleanup();
      setError(describeError(cause));
    } finally {
      isStartingRef.current = false;
    }
  }, [cleanup, describeError, handleMessage, startMeter, t]);

  const stop = useCallback(() => {
    isStoppingRef.current = true;
    cleanup();
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    const next = !isMutedRef.current;
    isMutedRef.current = next;
    captureRef.current?.setMuted(next);
    setIsMuted(next);
  }, []);

  const sendText = useCallback((text: string) => {
    const trimmed = text.trim();

    if (trimmed === "" || !sessionRef.current) return false;

    sessionRef.current.sendRealtimeInput({ text: trimmed });
    return true;
  }, []);

  useEffect(
    () => () => {
      isStoppingRef.current = true;
      cleanup();
    },
    [cleanup],
  );

  return { status, level, isMuted, error, start, stop, toggleMute, sendText };
};

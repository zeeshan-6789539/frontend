"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  RECORDER_MAX_SECONDS,
  RECORDER_NO_SPEECH_SECONDS,
  RECORDER_SAMPLE_RATE,
  RECORDER_SILENCE_STOP_SECONDS,
  RECORDER_SPEECH_LEVEL,
  RECORDER_WORKLET_NAME,
  RECORDER_WORKLET_SOURCE,
} from "@/config/audio";
import { useIsHydrated } from "@/hooks/use-is-hydrated";
import { arrayBufferToBase64 } from "@/utils/base64";
import { isAudioRecordingSupported } from "@/utils/speech";
import { downsample, encodeWav, getPeakLevel, mergeFloat32 } from "@/utils/wav";
import type {
  IRecorderSession,
  IUseAudioRecorderOptions,
  IUseAudioRecorderResult,
  TAudioRecorderError,
} from "@/types/speech";

const releaseSession = (session: IRecorderSession): void => {
  session.stream.getTracks().forEach((track) => track.stop());
  void session.context.close();
};

// Records one spoken question as 16 kHz WAV and stops by itself once the speaker pauses
export const useAudioRecorder = ({ onRecorded }: IUseAudioRecorderOptions): IUseAudioRecorderResult => {
  const isHydrated = useIsHydrated();
  const sessionRef = useRef<IRecorderSession | null>(null);
  const onRecordedRef = useRef(onRecorded);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<TAudioRecorderError | null>(null);

  useEffect(() => {
    onRecordedRef.current = onRecorded;
  }, [onRecorded]);

  const finish = useCallback((shouldDeliver: boolean) => {
    const session = sessionRef.current;

    if (!session) return;

    sessionRef.current = null;
    releaseSession(session);
    setIsRecording(false);

    if (!shouldDeliver) return;

    if (!session.hasSpeech) {
      setError("no-speech");
      return;
    }

    const samples = downsample(mergeFloat32(session.chunks), session.context.sampleRate, RECORDER_SAMPLE_RATE);
    onRecordedRef.current({
      base64: arrayBufferToBase64(encodeWav(samples, RECORDER_SAMPLE_RATE)),
      mimeType: "audio/wav",
    });
  }, []);

  useEffect(() => () => finish(false), [finish]);

  const start = useCallback(async () => {
    if (sessionRef.current || !isAudioRecordingSupported()) return;

    setError(null);

    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
    } catch (cause) {
      setError(cause instanceof DOMException && cause.name === "NotAllowedError" ? "not-allowed" : "other");
      return;
    }

    const context = new AudioContext();
    const session: IRecorderSession = {
      stream,
      context,
      chunks: [],
      elapsedSamples: 0,
      lastLoudSample: 0,
      hasSpeech: false,
    };

    try {
      const moduleUrl = URL.createObjectURL(new Blob([RECORDER_WORKLET_SOURCE], { type: "text/javascript" }));
      await context.audioWorklet.addModule(moduleUrl);
      URL.revokeObjectURL(moduleUrl);

      const recorder = new AudioWorkletNode(context, RECORDER_WORKLET_NAME);
      const rate = context.sampleRate;

      recorder.port.onmessage = (event: MessageEvent<Float32Array>) => {
        if (sessionRef.current !== session) return;

        session.chunks.push(event.data);
        session.elapsedSamples += event.data.length;

        if (getPeakLevel(event.data) >= RECORDER_SPEECH_LEVEL) {
          session.hasSpeech = true;
          session.lastLoudSample = session.elapsedSamples;
        }

        const seconds = session.elapsedSamples / rate;
        const quietSeconds = (session.elapsedSamples - session.lastLoudSample) / rate;

        if (seconds >= RECORDER_MAX_SECONDS) finish(true);
        else if (session.hasSpeech && quietSeconds >= RECORDER_SILENCE_STOP_SECONDS) finish(true);
        else if (!session.hasSpeech && seconds >= RECORDER_NO_SPEECH_SECONDS) finish(true);
      };

      // The worklet writes no output, so routing it to the speakers stays silent but keeps it processing
      context.createMediaStreamSource(stream).connect(recorder);
      recorder.connect(context.destination);
    } catch {
      releaseSession(session);
      setError("other");
      return;
    }

    sessionRef.current = session;
    setIsRecording(true);
  }, [finish]);

  const stop = useCallback(() => finish(true), [finish]);

  return {
    isSupported: isHydrated && isAudioRecordingSupported(),
    isRecording,
    error,
    start,
    stop,
  };
};

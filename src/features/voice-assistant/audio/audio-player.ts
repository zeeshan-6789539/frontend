import { ASSISTANT_OUTPUT_SAMPLE_RATE } from "@/config/assistant";
import { getRmsLevel, pcm16Base64ToFloat32 } from "@/utils/audio";
import type { IAudioPlayerHandle } from "@/types/voice-assistant";

// Schedules each reply chunk right after the previous one so speech plays without gaps
export const createAudioPlayer = (): IAudioPlayerHandle => {
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  const levelBuffer = new Uint8Array(analyser.fftSize);
  const activeSources = new Set<AudioBufferSourceNode>();
  let nextStartTime = 0;

  analyser.connect(context.destination);

  return {
    enqueue: (base64Pcm) => {
      const samples = pcm16Base64ToFloat32(base64Pcm);

      if (samples.length === 0) return;
      if (context.state === "suspended") void context.resume();

      const buffer = context.createBuffer(1, samples.length, ASSISTANT_OUTPUT_SAMPLE_RATE);
      buffer.copyToChannel(samples, 0);

      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(analyser);
      source.onended = () => activeSources.delete(source);

      nextStartTime = Math.max(nextStartTime, context.currentTime);
      source.start(nextStartTime);
      nextStartTime += buffer.duration;
      activeSources.add(source);
    },
    // The user spoke over the reply, so whatever is queued is dropped at once
    interrupt: () => {
      activeSources.forEach((source) => {
        source.onended = null;
        source.stop();
      });
      activeSources.clear();
      nextStartTime = 0;
    },
    isPlaying: () => activeSources.size > 0,
    getLevel: () => {
      analyser.getByteTimeDomainData(levelBuffer);
      return getRmsLevel(levelBuffer);
    },
    close: () => {
      activeSources.clear();
      void context.close();
    },
  };
};

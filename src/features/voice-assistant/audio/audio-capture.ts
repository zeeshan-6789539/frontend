import {
  ASSISTANT_CAPTURE_WORKLET_NAME,
  ASSISTANT_CAPTURE_WORKLET_PATH,
  ASSISTANT_INPUT_SAMPLE_RATE,
} from "@/config/assistant";
import { downsample, float32ToPcm16Base64, getRmsLevel } from "@/utils/audio";
import type { IAudioCaptureHandle, IAudioCaptureOptions } from "@/types/voice-assistant";

// Captures at the device rate and downsamples itself, since not every browser resamples a mic stream
export const startAudioCapture = async ({
  onChunk,
  onLevel,
}: IAudioCaptureOptions): Promise<IAudioCaptureHandle> => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  const context = new AudioContext();

  try {
    await context.audioWorklet.addModule(ASSISTANT_CAPTURE_WORKLET_PATH);
  } catch (error) {
    stream.getTracks().forEach((track) => track.stop());
    await context.close();
    throw error;
  }

  const source = context.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(context, ASSISTANT_CAPTURE_WORKLET_NAME);
  let isMuted = false;

  node.port.onmessage = (event: MessageEvent<Float32Array>) => {
    if (isMuted) {
      onLevel(0);
      return;
    }

    onLevel(getRmsLevel(event.data));
    onChunk(
      float32ToPcm16Base64(downsample(event.data, context.sampleRate, ASSISTANT_INPUT_SAMPLE_RATE)),
    );
  };

  source.connect(node);

  return {
    setMuted: (nextIsMuted) => {
      isMuted = nextIsMuted;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !nextIsMuted;
      });
    },
    stop: () => {
      node.port.onmessage = null;
      source.disconnect();
      node.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      void context.close();
    },
  };
};

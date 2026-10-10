// 16 kHz mono is plenty for speech and keeps a 30 s clip under the backend's 2 MB body limit
export const RECORDER_SAMPLE_RATE = 16_000;
export const RECORDER_MAX_SECONDS = 30;
// Stop automatically once the speaker has paused this long after talking
export const RECORDER_SILENCE_STOP_SECONDS = 1.5;
// Give up when nothing louder than background noise arrives in this window
export const RECORDER_NO_SPEECH_SECONDS = 8;
// Peak level (0–1) that counts as speech rather than room noise
export const RECORDER_SPEECH_LEVEL = 0.04;
export const RECORDER_WORKLET_NAME = "rms-audio-recorder";

// Batches the 128-frame render quanta so the main thread gets ~10 messages a second
export const RECORDER_WORKLET_SOURCE = `
class RmsAudioRecorder extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.size = 0;
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];

    if (channel) {
      this.buffer.push(channel.slice(0));
      this.size += channel.length;

      if (this.size >= 4096) {
        const chunk = new Float32Array(this.size);
        let offset = 0;
        for (const part of this.buffer) {
          chunk.set(part, offset);
          offset += part.length;
        }
        this.port.postMessage(chunk, [chunk.buffer]);
        this.buffer = [];
        this.size = 0;
      }
    }

    return true;
  }
}

registerProcessor("${RECORDER_WORKLET_NAME}", RmsAudioRecorder);
`;

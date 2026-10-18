// Buffers microphone frames into ~100 ms chunks and posts them to the main thread
const CHUNK_SECONDS = 0.1;

class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.chunkSize = Math.round(sampleRate * CHUNK_SECONDS);
    this.buffer = new Float32Array(this.chunkSize);
    this.offset = 0;
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];

    if (!channel) return true;

    let read = 0;

    while (read < channel.length) {
      const count = Math.min(channel.length - read, this.chunkSize - this.offset);
      this.buffer.set(channel.subarray(read, read + count), this.offset);
      this.offset += count;
      read += count;

      if (this.offset === this.chunkSize) {
        this.port.postMessage(this.buffer.slice(0));
        this.offset = 0;
      }
    }

    return true;
  }
}

registerProcessor("pcm-capture-processor", PcmCaptureProcessor);

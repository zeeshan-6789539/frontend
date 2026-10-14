const PCM16_MAX = 0x7fff;

export const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
};

export const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

// Averages each window of source samples, which also acts as a simple low-pass filter
export const downsample = (
  samples: Float32Array,
  fromRate: number,
  toRate: number,
): Float32Array => {
  if (fromRate === toRate) return samples;

  const ratio = fromRate / toRate;
  const length = Math.floor(samples.length / ratio);
  const result = new Float32Array(length);

  for (let index = 0; index < length; index += 1) {
    const start = Math.floor(index * ratio);
    const end = Math.min(Math.floor((index + 1) * ratio), samples.length);
    let sum = 0;

    for (let cursor = start; cursor < end; cursor += 1) sum += samples[cursor];

    result[index] = end > start ? sum / (end - start) : 0;
  }

  return result;
};

export const float32ToPcm16Base64 = (samples: Float32Array): string => {
  const view = new DataView(new ArrayBuffer(samples.length * 2));

  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(index * 2, clamped * PCM16_MAX, true);
  });

  return bytesToBase64(new Uint8Array(view.buffer));
};

export const pcm16Base64ToFloat32 = (base64: string): Float32Array<ArrayBuffer> => {
  const bytes = base64ToBytes(base64);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const result = new Float32Array(Math.floor(bytes.byteLength / 2));

  for (let index = 0; index < result.length; index += 1) {
    result[index] = view.getInt16(index * 2, true) / PCM16_MAX;
  }

  return result;
};

// Root-mean-square loudness, roughly 0 (silence) to 1 (clipping)
export const getRmsLevel = (samples: Float32Array | Uint8Array): number => {
  if (samples.length === 0) return 0;

  let sum = 0;

  for (let index = 0; index < samples.length; index += 1) {
    const value = samples instanceof Uint8Array ? (samples[index] - 128) / 128 : samples[index];
    sum += value * value;
  }

  return Math.sqrt(sum / samples.length);
};

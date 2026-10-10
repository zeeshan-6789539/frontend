const WAV_HEADER_BYTES = 44;

export const mergeFloat32 = (chunks: readonly Float32Array[]): Float32Array => {
  const merged = new Float32Array(chunks.reduce((total, chunk) => total + chunk.length, 0));
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return merged;
};

export const getPeakLevel = (samples: Float32Array): number => {
  let peak = 0;

  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));

  return peak;
};

// Averages each window of source samples, which also acts as a cheap low-pass filter
export const downsample = (samples: Float32Array, fromRate: number, toRate: number): Float32Array => {
  if (toRate >= fromRate) return samples;

  const ratio = fromRate / toRate;
  const result = new Float32Array(Math.floor(samples.length / ratio));

  for (let index = 0; index < result.length; index++) {
    const start = Math.floor(index * ratio);
    const end = Math.min(Math.floor((index + 1) * ratio), samples.length);
    let sum = 0;

    for (let source = start; source < end; source++) sum += samples[source];

    result[index] = sum / Math.max(end - start, 1);
  }

  return result;
};

// 16-bit mono PCM WAV
export const encodeWav = (samples: Float32Array, sampleRate: number): ArrayBuffer => {
  const buffer = new ArrayBuffer(WAV_HEADER_BYTES + samples.length * 2);
  const view = new DataView(buffer);
  const writeText = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index++) view.setUint8(offset + index, text.charCodeAt(index));
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, samples.length * 2, true);

  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(WAV_HEADER_BYTES + index * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  });

  return buffer;
};

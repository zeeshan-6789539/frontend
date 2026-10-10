export type TAudioRecorderError = "not-allowed" | "no-speech" | "other";

export interface IRecordedAudio {
  base64: string;
  mimeType: string;
}

export interface IUseAudioRecorderOptions {
  onRecorded: (audio: IRecordedAudio) => void;
}

export interface IUseAudioRecorderResult {
  isSupported: boolean;
  isRecording: boolean;
  error: TAudioRecorderError | null;
  start: () => Promise<void>;
  stop: () => void;
}

export interface IRecorderSession {
  stream: MediaStream;
  context: AudioContext;
  chunks: Float32Array[];
  elapsedSamples: number;
  lastLoudSample: number;
  hasSpeech: boolean;
}

export interface IUseSpeechSynthesisResult {
  isSupported: boolean;
  isSpeaking: boolean;
  speak: (text: string, lang: string) => void;
  cancel: () => void;
}

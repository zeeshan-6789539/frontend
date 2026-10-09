// Minimal Web Speech API shapes — lib.dom ships the result types but not SpeechRecognition itself
export interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

export interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export type TSpeechRecognitionConstructor = new () => ISpeechRecognition;

export interface ISpeechWindow {
  SpeechRecognition?: TSpeechRecognitionConstructor;
  webkitSpeechRecognition?: TSpeechRecognitionConstructor;
}

export type TSpeechRecognitionError = "not-allowed" | "no-speech" | "other";

export interface IUseSpeechRecognitionOptions {
  lang: string;
  onResult: (transcript: string) => void;
}

export interface IUseSpeechRecognitionResult {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  error: TSpeechRecognitionError | null;
  start: () => void;
  stop: () => void;
}

export interface IUseSpeechSynthesisResult {
  isSupported: boolean;
  isSpeaking: boolean;
  speak: (text: string, lang: string) => void;
  cancel: () => void;
}

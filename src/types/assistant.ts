export type TAssistantRole = "user" | "model";

export type TAssistantScript = "urdu" | "roman";

export interface IAssistantHistoryItem {
  role: TAssistantRole;
  text: string;
}

export interface IAssistantMessage extends IAssistantHistoryItem {
  id: string;
  isFailed?: boolean;
}

export interface IAssistantChatPayload {
  message: string;
  history: IAssistantHistoryItem[];
}

export interface IAssistantReply {
  reply: string;
  toolsUsed: string[];
}

export interface IAssistantTranscribePayload {
  audioBase64: string;
  mimeType: string;
  script: TAssistantScript;
}

export interface IAssistantTranscript {
  transcript: string;
}

export interface IAssistantSpeech {
  mimeType: string;
  audioBase64: string;
}

export interface IUseAssistantVoiceResult {
  isPreparing: boolean;
  isPlaying: boolean;
  speak: (text: string) => void;
  cancel: () => void;
}

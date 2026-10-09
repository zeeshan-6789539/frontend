import type { IApiError } from "@/types/api";
import type { IAssistantMessage } from "@/types/assistant";

export interface IAssistantPanelProps {
  messages: readonly IAssistantMessage[];
  isPending: boolean;
  error: IApiError | null;
  speechLang: string;
  canSpeak: boolean;
  isSpeaking: boolean;
  isVoiceReplyOn: boolean;
  onSend: (text: string, isVoice: boolean) => void;
  onClear: () => void;
  onClose: () => void;
  onStopSpeaking: () => void;
  onToggleVoiceReply: () => void;
}

export interface IAssistantComposerProps {
  isPending: boolean;
  speechLang: string;
  onSend: (text: string, isVoice: boolean) => void;
  onListenStart: () => void;
}

export interface IAssistantMessageBubbleProps {
  message: IAssistantMessage;
}

export interface IAssistantSuggestionsProps {
  isDisabled: boolean;
  onPick: (text: string) => void;
}

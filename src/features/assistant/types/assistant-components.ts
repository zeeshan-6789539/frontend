import type { IApiError } from "@/types/api";
import type { IAssistantMessage, TAssistantScript } from "@/types/assistant";

export interface IAssistantPanelProps {
  messages: readonly IAssistantMessage[];
  isPending: boolean;
  error: IApiError | null;
  transcriptScript: TAssistantScript;
  isVoiceBusy: boolean;
  isVoicePreparing: boolean;
  isVoiceReplyOn: boolean;
  onSend: (text: string, isVoice: boolean) => void;
  onPlay: (text: string) => void;
  onClear: () => void;
  onClose: () => void;
  onStopSpeaking: () => void;
  onToggleVoiceReply: () => void;
}

export interface IAssistantComposerProps {
  isPending: boolean;
  transcriptScript: TAssistantScript;
  onSend: (text: string, isVoice: boolean) => void;
  onListenStart: () => void;
}

export interface IAssistantMessageBubbleProps {
  message: IAssistantMessage;
  onPlay: (text: string) => void;
}

export interface IAssistantSuggestionsProps {
  isDisabled: boolean;
  onPick: (text: string) => void;
}

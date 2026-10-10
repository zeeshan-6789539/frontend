import type { TAssistantScript } from "@/types/assistant";
import type { TLocale } from "@/types/locale";

// Mirrors AI_CHAT_HISTORY_MAX_ITEMS, AI_CHAT_MESSAGE_MAX_LENGTH and AI_SPEECH_TEXT_MAX_LENGTH on the backend
export const ASSISTANT_HISTORY_LIMIT = 20;
export const ASSISTANT_MESSAGE_MAX_LENGTH = 2000;
export const ASSISTANT_SPEECH_MAX_LENGTH = 600;

// The backend allows 60 s for chat and transcription, 100 s for speech
export const ASSISTANT_REQUEST_TIMEOUT_MS = 65_000;
export const ASSISTANT_SPEECH_TIMEOUT_MS = 105_000;

// Browser voice used only when Gemini's voice is unavailable
export const SPEECH_LANGUAGES: Record<TLocale, string> = {
  en: "en-US",
  ur: "ur-PK",
};

// English UI users usually type Urdu in Latin letters, so they get Roman Urdu back
export const TRANSCRIPT_SCRIPTS: Record<TLocale, TAssistantScript> = {
  en: "roman",
  ur: "urdu",
};

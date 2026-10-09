import type { TLocale } from "@/types/locale";

// Mirrors AI_CHAT_HISTORY_MAX_ITEMS and AI_CHAT_MESSAGE_MAX_LENGTH on the backend
export const ASSISTANT_HISTORY_LIMIT = 20;
export const ASSISTANT_MESSAGE_MAX_LENGTH = 2000;

// The backend route allows 60 s because one answer can take several Gemini calls
export const ASSISTANT_REQUEST_TIMEOUT_MS = 65_000;

export const SPEECH_LANGUAGES: Record<TLocale, string> = {
  en: "en-US",
  ur: "ur-PK",
};

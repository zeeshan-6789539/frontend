import type { TUserRole } from "@/types/user";

// Mirrors @Roles on the backend's AssistantController; only company admins get the add-record forms
export const ASSISTANT_ROLES: readonly TUserRole[] = ["client_admin"];
export const ASSISTANT_FORM_ROLES: readonly TUserRole[] = ["client_admin"];

// Gemini Live expects 16 kHz PCM in and sends 24 kHz PCM back
export const ASSISTANT_INPUT_SAMPLE_RATE = 16_000;
export const ASSISTANT_OUTPUT_SAMPLE_RATE = 24_000;
export const ASSISTANT_INPUT_MIME_TYPE = `audio/pcm;rate=${ASSISTANT_INPUT_SAMPLE_RATE}`;

export const ASSISTANT_CAPTURE_WORKLET_PATH = "/worklets/pcm-capture-processor.js";
export const ASSISTANT_CAPTURE_WORKLET_NAME = "pcm-capture-processor";

// Must match the Live token's API version issued by the backend
export const ASSISTANT_API_VERSION = "v1alpha";

export const ASSISTANT_PATH = "/assistant";

export const ASSISTANT_OPTIONS_QUERY_KEY = ["assistant-options"] as const;

// Orb animation steps; the level is quantised so it can drive a data attribute
export const ASSISTANT_LEVEL_STEPS = 5;

export const ASSISTANT_MAX_OPTIONS_READ_ALOUD = 8;
export const ASSISTANT_SEARCH_LIMIT = 5;
export const ASSISTANT_TRANSCRIPT_LIMIT = 80;

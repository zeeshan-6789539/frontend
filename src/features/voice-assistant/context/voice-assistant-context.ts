"use client";

import { createContext } from "react";
import type { IAssistantContextValue } from "@/types/voice-assistant";

export const VoiceAssistantContext = createContext<IAssistantContextValue | null>(null);

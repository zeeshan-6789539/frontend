"use client";

import { useContext } from "react";
import { VoiceAssistantContext } from "@/features/voice-assistant/context/voice-assistant-context";
import type { IAssistantContextValue } from "@/types/voice-assistant";

export const useVoiceAssistant = (): IAssistantContextValue => {
  const context = useContext(VoiceAssistantContext);

  if (!context) throw new Error("useVoiceAssistant must be used inside a VoiceAssistantProvider");

  return context;
};

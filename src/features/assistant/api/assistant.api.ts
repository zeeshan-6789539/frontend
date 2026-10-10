import { ASSISTANT_REQUEST_TIMEOUT_MS, ASSISTANT_SPEECH_TIMEOUT_MS } from "@/config/assistant";
import { apiClient } from "@/lib/api-client";
import type {
  IAssistantChatPayload,
  IAssistantReply,
  IAssistantSpeech,
  IAssistantTranscribePayload,
  IAssistantTranscript,
} from "@/types/assistant";

export const sendAssistantMessage = async (
  payload: IAssistantChatPayload,
): Promise<IAssistantReply> => {
  const { data } = await apiClient.post<IAssistantReply>("/ai/chat", payload, {
    timeout: ASSISTANT_REQUEST_TIMEOUT_MS,
  });
  return data;
};

export const transcribeSpeech = async (
  payload: IAssistantTranscribePayload,
): Promise<IAssistantTranscript> => {
  const { data } = await apiClient.post<IAssistantTranscript>("/ai/transcribe", payload, {
    timeout: ASSISTANT_REQUEST_TIMEOUT_MS,
  });
  return data;
};

export const synthesizeSpeech = async (text: string): Promise<IAssistantSpeech> => {
  const { data } = await apiClient.post<IAssistantSpeech>(
    "/ai/speech",
    { text },
    { timeout: ASSISTANT_SPEECH_TIMEOUT_MS },
  );
  return data;
};

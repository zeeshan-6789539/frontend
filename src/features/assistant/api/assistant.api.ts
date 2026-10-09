import { ASSISTANT_REQUEST_TIMEOUT_MS } from "@/config/assistant";
import { apiClient } from "@/lib/api-client";
import type { IAssistantChatPayload, IAssistantReply } from "@/types/assistant";

export const sendAssistantMessage = async (
  payload: IAssistantChatPayload,
): Promise<IAssistantReply> => {
  const { data } = await apiClient.post<IAssistantReply>("/ai/chat", payload, {
    timeout: ASSISTANT_REQUEST_TIMEOUT_MS,
  });
  return data;
};

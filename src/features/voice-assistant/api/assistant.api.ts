import { apiClient } from "@/lib/api-client";
import type { IAssistantSession } from "@/types/voice-assistant";

const ASSISTANT_SESSION_PATH = "/assistant/session";

export const createAssistantSession = async (): Promise<IAssistantSession> => {
  const { data } = await apiClient.post<IAssistantSession>(ASSISTANT_SESSION_PATH);
  return data;
};

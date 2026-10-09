"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ASSISTANT_HISTORY_LIMIT } from "@/config/assistant";
import { sendAssistantMessage } from "@/features/assistant/api/assistant.api";
import type { IApiError } from "@/types/api";
import type {
  IAssistantChatPayload,
  IAssistantHistoryItem,
  IAssistantMessage,
  IAssistantReply,
} from "@/types/assistant";

// The backend is stateless, so the conversation lives here and is replayed as history
export const useAssistantChat = () => {
  const [messages, setMessages] = useState<IAssistantMessage[]>([]);
  const mutation = useMutation<IAssistantReply, IApiError, IAssistantChatPayload>({
    mutationFn: sendAssistantMessage,
  });

  const send = (text: string, onReply?: (reply: string) => void): void => {
    const message = text.trim();

    if (!message || mutation.isPending) return;

    // Failed questions never got an answer, so they are left out of what Gemini sees
    const history: IAssistantHistoryItem[] = messages
      .filter((item) => !item.isFailed)
      .slice(-ASSISTANT_HISTORY_LIMIT)
      .map(({ role, text: itemText }) => ({ role, text: itemText }));
    const userMessage: IAssistantMessage = { id: crypto.randomUUID(), role: "user", text: message };

    setMessages((current) => [...current, userMessage]);
    mutation.mutate(
      { message, history },
      {
        onSuccess: ({ reply }) => {
          setMessages((current) => [
            ...current,
            { id: crypto.randomUUID(), role: "model", text: reply },
          ]);
          onReply?.(reply);
        },
        onError: () => {
          setMessages((current) =>
            current.map((item) => (item.id === userMessage.id ? { ...item, isFailed: true } : item)),
          );
        },
      },
    );
  };

  const clear = (): void => {
    mutation.reset();
    setMessages([]);
  };

  return {
    messages,
    send,
    clear,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

"use client";

import { useMutation } from "@tanstack/react-query";
import { transcribeSpeech } from "@/features/assistant/api/assistant.api";
import type { IApiError } from "@/types/api";
import type { IAssistantTranscribePayload, IAssistantTranscript } from "@/types/assistant";

export const useTranscribeSpeech = () =>
  useMutation<IAssistantTranscript, IApiError, IAssistantTranscribePayload>({
    mutationFn: transcribeSpeech,
  });

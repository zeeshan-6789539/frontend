"use client";

import { RequireRole } from "@/components/layout/require-role";
import { ASSISTANT_ROLES } from "@/config/assistant";
import { canUseVoiceAssistant } from "@/utils/access";
import type { IAssistantOnlyProps } from "@/types/layout";

// Passes the feature-flag check client-side, since functions can't cross from a server page
export const AssistantOnly = ({ children }: IAssistantOnlyProps) => (
  <RequireRole roles={ASSISTANT_ROLES} isAllowed={canUseVoiceAssistant}>
    {children}
  </RequireRole>
);

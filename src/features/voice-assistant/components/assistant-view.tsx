"use client";

import { AssistantFormCard } from "@/features/voice-assistant/components/assistant-form-card";
import { AssistantLiveBar } from "@/features/voice-assistant/components/assistant-live-bar";
import { AssistantTranscript } from "@/features/voice-assistant/components/assistant-transcript";
import { useVoiceAssistant } from "@/features/voice-assistant/hooks/use-voice-assistant";
import { cn } from "@/utils/cn";

// Full-height Gemini Live layout: conversation on top, glow and one-line controls at the bottom
export const AssistantView = () => {
  const { status, level, forms } = useVoiceAssistant();
  const hasForm = forms.length > 0;

  return (
    <div
      className={cn(
        "grid h-[calc(100dvh-1.5rem)] gap-3",
        hasForm && "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
      )}
    >
      <section className="relative flex min-h-0 flex-col overflow-hidden rounded-card border border-border bg-card">
        <AssistantTranscript className="min-h-0 flex-1 px-4 pt-4 pb-2 max-md:pt-16" />
        <div
          data-status={status}
          data-level={status === "idle" ? 0 : level}
          aria-hidden
          className="live-glow"
        />
        <div className="relative px-3 pb-3">
          <AssistantLiveBar />
        </div>
      </section>

      {hasForm ? <AssistantFormCard className="min-h-0 overflow-y-auto" /> : null}
    </div>
  );
};

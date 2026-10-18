"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Maximize2, Minus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ASSISTANT_PATH } from "@/config/assistant";
import { AssistantLiveBar } from "@/features/voice-assistant/components/assistant-live-bar";
import { AssistantFormCard } from "@/features/voice-assistant/components/assistant-form-card";
import { VoiceOrb } from "@/features/voice-assistant/components/voice-orb";
import { useVoiceAssistant } from "@/features/voice-assistant/hooks/use-voice-assistant";
import { Link, usePathname } from "@/i18n/navigation";

// Voice control from any dashboard page; hidden on the full assistant page
export const FloatingAssistant = () => {
  const t = useTranslations("assistant");
  const pathname = usePathname();
  const { status, level, forms, isAvailable } = useVoiceAssistant();
  const [isOpen, setIsOpen] = useState(false);
  const [collapsedFormId, setCollapsedFormId] = useState<string | null>(null);
  const activeForm = forms.at(-1);
  // A form opened by voice pops the panel open until the user minimises it
  const isExpanded = isOpen || (activeForm !== undefined && activeForm.id !== collapsedFormId);

  if (!isAvailable || pathname === ASSISTANT_PATH) return null;

  const collapse = () => {
    setIsOpen(false);
    setCollapsedFormId(activeForm?.id ?? null);
  };

  return (
    <div className="fixed bottom-4 end-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3">
      {isExpanded ? (
        <div className="flex max-h-[calc(100dvh-6rem)] w-[24rem] max-w-full flex-col gap-3 overflow-y-auto rounded-card border border-border bg-popover p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <VoiceOrb status={status} level={level} size="md" />
            <p className="flex-1 font-semibold">{t("title")}</p>
            <Link
              href={ASSISTANT_PATH}
              aria-label={t("openFull")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Maximize2 className="h-4 w-4" aria-hidden />
            </Link>
            <Button variant="ghost" size="icon" onClick={collapse} aria-label={t("minimize")}>
              <Minus className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <AssistantLiveBar />
          {activeForm ? <AssistantFormCard isCompact className="p-4 shadow-none" /> : null}
        </div>
      ) : null}

      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={t("openPanel")}
          className="voice-launcher relative rounded-full shadow-brand transition-transform hover:scale-105 focus-visible:scale-105"
        >
          <VoiceOrb status={status} level={level} size="md" />
          <Sparkles
            className="voice-launcher-icon pointer-events-none absolute inset-0 m-auto h-5 w-5 text-primary-foreground drop-shadow-sm"
            aria-hidden
          />
        </button>
      ) : null}
    </div>
  );
};

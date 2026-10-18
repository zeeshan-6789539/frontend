import { cn } from "@/utils/cn";
import type { IAssistantOrbProps } from "@/features/voice-assistant/types/voice-assistant-components";

export const VoiceOrb = ({ status, level, size = "lg" }: IAssistantOrbProps) => (
  <div
    data-status={status}
    data-level={status === "idle" ? 0 : level}
    aria-hidden
    className={cn("voice-orb", size === "lg" ? "h-36 w-36 sm:h-44 sm:w-44" : "h-12 w-12")}
  >
    <span className="voice-orb-ring" />
    <span className="voice-orb-core" />
  </div>
);

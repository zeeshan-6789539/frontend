import type { ReactNode } from "react";
import type {
  IAssistantFieldDef,
  IAssistantFormState,
  IAssistantSearchResults,
  TAssistantStatus,
} from "@/types/voice-assistant";

export interface IAssistantProviderProps {
  children: ReactNode;
}

export interface IAssistantFieldControlProps {
  form: IAssistantFormState;
  field: IAssistantFieldDef;
}

export interface IAssistantFormCardProps {
  className?: string;
  isCompact?: boolean;
}

export interface IAssistantTranscriptProps {
  className?: string;
}

export interface IAssistantSearchResultsProps {
  results: IAssistantSearchResults;
}

export interface IAssistantOrbProps {
  status: TAssistantStatus;
  level: number;
  size?: "md" | "lg";
}

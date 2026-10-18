import type { FunctionCall, FunctionDeclaration } from "@google/genai";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { ZodType } from "zod";
import type { TLocale } from "@/types/locale";
import type { ISelectOption } from "@/types/ui";
import type { TUserRole } from "@/types/user";

export type TAssistantFormType = "property" | "propertyType" | "tenant" | "lease" | "payment";

export type TAssistantFieldKind =
  | "text"
  | "textarea"
  | "amount"
  | "number"
  | "phone"
  | "email"
  | "url"
  | "date"
  | "select";

export type TAssistantOptionSource =
  | "propertyTypes"
  | "properties"
  | "tenants"
  | "leases"
  | "paymentMethods";

export type TAssistantValue = string;

export type TAssistantValues = Record<string, TAssistantValue>;

export type TAssistantStage = "collecting" | "review" | "saving";

export type TAssistantStatus = "idle" | "connecting" | "listening" | "speaking" | "thinking";

export type TAssistantSpeaker = "user" | "assistant" | "system";

export type TAssistantSearchModule =
  | "properties"
  | "propertyTypes"
  | "tenants"
  | "leases"
  | "payments";

export interface IAssistantOptionContext {
  queryClient: QueryClient;
  translate: (key: string) => string;
  search?: string;
}

export interface IAssistantOptionSourceDef {
  load: (context: IAssistantOptionContext) => Promise<ISelectOption[]>;
  // Large lists are searched on the server instead of matched locally
  searchesServer?: boolean;
}

export interface IAssistantFieldDef {
  key: string;
  labelKey: string;
  kind: TAssistantFieldKind;
  required: boolean;
  // Plain-English hint for Gemini on how to ask or fill this field
  hint?: string;
  placeholderKey?: string;
  source?: TAssistantOptionSource;
  // The nested form that can create a missing option, e.g. a new tenant for a lease
  createWith?: TAssistantFormType;
  isVisible?: (values: TAssistantValues) => boolean;
}

export interface IAssistantSavedRecord {
  id: string;
  label: string;
}

export interface IAssistantFormDef<TPayload = unknown> {
  type: TAssistantFormType;
  titleKey: string;
  // Prefix for the schema's message-catalogue keys, e.g. "properties.errors"
  errorsKey: string;
  listPath: string;
  fields: readonly IAssistantFieldDef[];
  defaults: TAssistantValues;
  schema: ZodType;
  toPayload(values: TAssistantValues): TPayload;
  // Method syntax keeps every form assignable to the shared registry type
  submit(payload: TPayload): Promise<IAssistantSavedRecord>;
  invalidates: readonly QueryKey[];
}

export interface IAssistantFormState {
  id: string;
  type: TAssistantFormType;
  values: TAssistantValues;
  // Labels of chosen options, so a value reads back as "Sunset Apartments" rather than an id
  labels: Record<string, string>;
  errors: Record<string, string>;
  activeField: string | null;
  stage: TAssistantStage;
  // Set on a nested form: the parent field that receives the saved record
  parentField: string | null;
}

export interface IAssistantTranscriptEntry {
  id: string;
  speaker: TAssistantSpeaker;
  text: string;
  isFinal: boolean;
  results?: IAssistantSearchResults;
}

export interface IAssistantSearchResultItem {
  id: string;
  title: string;
  subtitle: string;
}

export interface IAssistantSearchResults {
  module: TAssistantSearchModule;
  query: string;
  total: number;
  items: IAssistantSearchResultItem[];
  path: string;
}

export interface IAssistantSession {
  token: string;
  model: string;
  expiresAt: string;
}

export interface IAssistantFieldInput {
  field: string;
  value: string;
}

export interface IAssistantFieldProblem {
  field: string;
  label: string;
  issue: "ambiguous" | "notFound" | "invalid" | "unknownField";
  message: string;
  candidates?: string[];
}

export interface IAssistantFieldSummary {
  field: string;
  label: string;
  kind: TAssistantFieldKind;
  required: boolean;
  hint?: string;
  options?: string[];
  canCreateNew?: boolean;
}

export interface IFormEngineContext {
  queryClient: QueryClient;
  translate: (key: string) => string;
}

export interface IAssistantFilledField {
  field: string;
  label: string;
  value: string;
}

export interface IAssistantApplyResult {
  state: IAssistantFormState;
  filled: IAssistantFilledField[];
  problems: IAssistantFieldProblem[];
}

export interface IAssistantFormReport {
  form: TAssistantFormType;
  stage: TAssistantStage;
  filled: IAssistantFilledField[];
  problems: IAssistantFieldProblem[];
  nextField: IAssistantFieldSummary | null;
  missingRequired: string[];
  optionalRemaining: string[];
  instruction: string;
}

export interface IAssistantToolResult {
  [key: string]: unknown;
  ok: boolean;
}

export interface IAssistantPromptContext {
  userName: string;
  role: TUserRole;
  locale: TLocale;
  today: string;
  pages: readonly string[];
  forms: readonly TAssistantFormType[];
}

export interface IAssistantContextValue {
  status: TAssistantStatus;
  isActive: boolean;
  isMuted: boolean;
  level: number;
  error: string | null;
  isAvailable: boolean;
  canUseForms: boolean;
  transcript: readonly IAssistantTranscriptEntry[];
  forms: readonly IAssistantFormState[];
  engineContext: IFormEngineContext;
  start: () => Promise<void>;
  stop: () => void;
  toggleMute: () => void;
  sendText: (text: string) => boolean;
  startForm: (type: TAssistantFormType) => Promise<void>;
  // Screen edits; commitField tells Gemini once the user has finished with a field
  setFieldValue: (field: string, value: TAssistantValue, label?: string) => void;
  commitField: (field: string) => void;
  focusField: (field: string) => void;
  reviewActiveForm: () => Promise<void>;
  submitActiveForm: () => Promise<IAssistantToolResult>;
  cancelActiveForm: () => void;
}

export interface ILiveSessionSetup {
  systemInstruction: string;
  functionDeclarations: FunctionDeclaration[];
  // Sent as the first text turn so the assistant opens the conversation
  greeting: string;
}

export interface ILiveSessionHandlers {
  getSetup: () => ILiveSessionSetup;
  onToolCall: (call: FunctionCall) => Promise<IAssistantToolResult>;
  onFragment: (speaker: TAssistantSpeaker, text: string) => void;
  onTurnComplete: () => void;
}

export interface IAudioCaptureHandle {
  stop: () => void;
  setMuted: (isMuted: boolean) => void;
}

export interface IAudioCaptureOptions {
  onChunk: (base64Pcm: string) => void;
  onLevel: (level: number) => void;
}

export interface IAudioPlayerHandle {
  enqueue: (base64Pcm: string) => void;
  interrupt: () => void;
  isPlaying: () => boolean;
  getLevel: () => number;
  close: () => void;
}

export interface IOptionMatch {
  status: "matched" | "ambiguous" | "notFound";
  option?: ISelectOption;
  candidates: ISelectOption[];
}

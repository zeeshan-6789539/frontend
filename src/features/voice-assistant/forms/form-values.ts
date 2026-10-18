import { emptyToUndefined } from "@/utils/string";
import type { TAssistantValue, TAssistantValues } from "@/types/voice-assistant";

export const getText = (values: TAssistantValues, key: string): string => values[key] ?? "";

export const getOptionalText = (values: TAssistantValues, key: string): string | undefined =>
  emptyToUndefined(getText(values, key));

// Blank becomes NaN so the schema rejects it with its own message
export const getNumber = (values: TAssistantValues, key: string): number => {
  const text = getText(values, key).trim();
  return text === "" ? Number.NaN : Number(text);
};

export const isEmptyValue = (value: TAssistantValue | undefined): boolean =>
  value === undefined || value.trim() === "";

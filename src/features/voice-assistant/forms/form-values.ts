import { toOptionalNumber } from "@/utils/number";
import { emptyToNull } from "@/utils/string";
import type { TAssistantValue, TAssistantValues } from "@/types/voice-assistant";

export const getText = (values: TAssistantValues, key: string): string => {
  const value = values[key];
  return typeof value === "string" ? value : "";
};

export const getList = (values: TAssistantValues, key: string): string[] => {
  const value = values[key];
  return Array.isArray(value) ? value : [];
};

export const getNullableText = (values: TAssistantValues, key: string): string | null =>
  emptyToNull(getText(values, key));

export const getNullableNumber = (values: TAssistantValues, key: string): number | null =>
  toOptionalNumber(getText(values, key));

export const isEmptyValue = (value: TAssistantValue | undefined): boolean =>
  value === undefined || (Array.isArray(value) ? value.length === 0 : value.trim() === "");

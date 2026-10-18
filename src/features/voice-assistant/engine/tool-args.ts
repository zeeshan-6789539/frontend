import type { IAssistantFieldInput } from "@/types/voice-assistant";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const getStringArg = (args: Record<string, unknown> | undefined, key: string): string => {
  const value = args?.[key];

  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  return "";
};

export const getEnumArg = <TValue extends string>(
  args: Record<string, unknown> | undefined,
  key: string,
  allowed: readonly TValue[],
): TValue | null => {
  const value = getStringArg(args, key);
  return (allowed as readonly string[]).includes(value) ? (value as TValue) : null;
};

// Gemini may send numbers for amounts; they are read as text like everything else
export const getFieldInputs = (args: Record<string, unknown> | undefined): IAssistantFieldInput[] => {
  const fields = args?.fields;

  if (!Array.isArray(fields)) return [];

  return fields.filter(isRecord).flatMap((item) => {
    const field = getStringArg(item, "field");

    return field === "" ? [] : [{ field, value: getStringArg(item, "value") }];
  });
};

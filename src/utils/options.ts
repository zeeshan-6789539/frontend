import type { ISelectOption } from "@/types/ui";

// Keeps already-chosen values selectable even when they dropped out of the live options
export const withMissingOptions = (
  options: readonly ISelectOption[],
  extras: readonly ISelectOption[],
): ISelectOption[] => [
  ...options,
  ...extras.filter((extra) => !options.some((option) => option.value === extra.value)),
];

export const emptyToUndefined = (value: string): string | undefined => {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
};

export const getInitials = (...parts: string[]): string =>
  parts
    .map((part) => part.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .join("");

// Cuts at the last sentence end (., ?, !, ۔, ؟) that fits, falling back to a hard cut
export const truncateAtSentence = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;

  const slice = text.slice(0, maxLength);
  const lastEnd = Math.max(...[".", "?", "!", "۔", "؟"].map((mark) => slice.lastIndexOf(mark)));

  return lastEnd > 0 ? slice.slice(0, lastEnd + 1) : slice;
};

export const matchesSearch = (
  search: string,
  ...values: (string | null | undefined)[]
): boolean => search === "" || values.some((value) => value?.toLowerCase().includes(search));

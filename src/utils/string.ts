export const emptyToUndefined = (value: string): string | undefined => {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
};

// For optional API fields where null clears the stored value
export const emptyToNull = (value: string): string | null =>
  emptyToUndefined(value) ?? null;

export const getInitials = (...parts: string[]): string =>
  parts
    .map((part) => part.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .join("");

export const matchesSearch = (
  search: string,
  ...values: (string | null | undefined)[]
): boolean => search === "" || values.some((value) => value?.toLowerCase().includes(search));

export const joinNames = (
  items: readonly { name: string }[],
  separator = " · ",
): string => items.map((item) => item.name).join(separator);

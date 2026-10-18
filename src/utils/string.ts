export const emptyToUndefined = (value: string): string | undefined => {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
};

export const getInitials = (...parts: string[]): string =>
  parts
    .map((part) => part.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .join("");

export const matchesSearch = (
  search: string,
  ...values: (string | null | undefined)[]
): boolean => search === "" || values.some((value) => value?.toLowerCase().includes(search));

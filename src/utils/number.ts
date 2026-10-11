// Blank input becomes null; anything else is parsed so the schema can reject it
export const toOptionalNumber = (value: string): number | null => {
  const trimmed = value.trim();

  return trimmed.length > 0 ? Number(trimmed) : null;
};

// Share of a whole as 0–1; an empty whole is 0 rather than NaN
export const toRatio = (part: number, whole: number): number =>
  whole > 0 ? part / whole : 0;

export const sumBy = <TItem>(items: readonly TItem[], pick: (item: TItem) => number): number =>
  items.reduce((total, item) => total + pick(item), 0);

export const toNumberInput = (value: number | null | undefined): string =>
  value === null || value === undefined ? "" : String(value);

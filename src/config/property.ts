// Capped at 28 so every month, February included, has that day
export const MIN_RENT_DUE_DAY = 1;
export const MAX_RENT_DUE_DAY = 28;
export const DEFAULT_RENT_DUE_DAY = 1;

export const RENT_DUE_DAYS = Array.from(
  { length: MAX_RENT_DUE_DAY - MIN_RENT_DUE_DAY + 1 },
  (_, index) => MIN_RENT_DUE_DAY + index,
);

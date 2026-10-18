import { getTodayIsoDate } from "@/utils/format";
import { toLatinDigits } from "@/utils/spoken-number";

const TODAY_WORDS = new Set(["today", "aaj", "آج"]);

const toIsoDate = (year: number, month: number, day: number): string | null => {
  const date = new Date(year, month - 1, day);
  const isReal =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  if (!isReal) return null;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

// "2026-03-15", "15/03/2026", "today" or "15 March 2026" → "2026-03-15"; null when it is not a date
export const parseSpokenDate = (input: string): string | null => {
  const text = toLatinDigits(input).trim().toLowerCase();

  if (TODAY_WORDS.has(text)) return getTodayIsoDate();

  const yearFirst = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (yearFirst) return toIsoDate(Number(yearFirst[1]), Number(yearFirst[2]), Number(yearFirst[3]));

  const dayFirst = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dayFirst) return toIsoDate(Number(dayFirst[3]), Number(dayFirst[2]), Number(dayFirst[1]));

  const parsed = new Date(text.replace(/(\d)(st|nd|rd|th)\b/g, "$1"));

  return Number.isNaN(parsed.getTime())
    ? null
    : toIsoDate(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
};

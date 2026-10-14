import type { IOptionMatch } from "@/types/voice-assistant";
import type { ISelectOption } from "@/types/ui";

export const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const getTokens = (value: string): string[] => normalizeText(value).split(" ").filter(Boolean);

// Share of the spoken words found in the option label, 0 to 1
const getTokenScore = (spoken: string, label: string): number => {
  const spokenTokens = getTokens(spoken);
  const labelTokens = getTokens(label);

  if (spokenTokens.length === 0) return 0;

  const hits = spokenTokens.filter((token) =>
    labelTokens.some((labelToken) => labelToken.startsWith(token) || token.startsWith(labelToken)),
  ).length;

  return hits / spokenTokens.length;
};

// Exact label, then id, then prefix or contains, then word overlap; ties are reported as ambiguous
export const matchOption = (
  options: readonly ISelectOption[],
  spoken: string,
): IOptionMatch => {
  const target = normalizeText(spoken);

  if (target === "") return { status: "notFound", candidates: [] };

  const exact = options.filter(
    (option) =>
      normalizeText(option.label) === target ||
      option.value.toLowerCase() === spoken.trim().toLowerCase(),
  );

  if (exact.length === 1) return { status: "matched", option: exact[0], candidates: exact };

  const partial = options.filter((option) => {
    const label = normalizeText(option.label);
    return label.startsWith(target) || label.includes(target) || target.includes(label);
  });

  if (partial.length === 1) return { status: "matched", option: partial[0], candidates: partial };
  if (partial.length > 1) return { status: "ambiguous", candidates: partial.slice(0, 6) };

  const scored = options
    .map((option) => ({ option, score: getTokenScore(spoken, option.label) }))
    .filter(({ score }) => score >= 0.5)
    .sort((left, right) => right.score - left.score);

  if (scored.length === 0) return { status: "notFound", candidates: [] };

  const best = scored.filter(({ score }) => score === scored[0].score);

  return best.length === 1
    ? { status: "matched", option: best[0].option, candidates: [best[0].option] }
    : { status: "ambiguous", candidates: best.slice(0, 6).map(({ option }) => option) };
};

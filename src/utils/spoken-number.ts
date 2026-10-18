// South Asian and English scale words a speaker may use for an amount
const SCALE_WORDS: Record<string, number> = {
  k: 1_000,
  thousand: 1_000,
  hazar: 1_000,
  hazaar: 1_000,
  hzar: 1_000,
  "ہزار": 1_000,
  lac: 100_000,
  lakh: 100_000,
  lakhs: 100_000,
  lacs: 100_000,
  "لاکھ": 100_000,
  m: 1_000_000,
  million: 1_000_000,
  crore: 10_000_000,
  crores: 10_000_000,
  karor: 10_000_000,
  karod: 10_000_000,
  "کروڑ": 10_000_000,
  arab: 1_000_000_000,
  billion: 1_000_000_000,
  "ارب": 1_000_000_000,
};

const URDU_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export const toLatinDigits = (value: string): string =>
  value.replace(/[۰-۹]/g, (digit) => String(URDU_DIGITS.indexOf(digit)));

// "2 crore 50 lakh" → 25000000, "85k" → 85000, "Rs. 1,250.50" → 1250.5; null when it is not an amount
export const parseSpokenAmount = (input: string): number | null => {
  const text = toLatinDigits(input)
    .toLowerCase()
    .replace(/(rs\.?|pkr|rupees?|روپے)/g, " ")
    .replace(/(\d),(?=\d)/g, "$1")
    .trim();

  if (text === "") return null;

  const tokens = text.match(/\d+(?:\.\d+)?|[^\s\d.]+/g) ?? [];
  let total = 0;
  let pending: number | null = null;
  let hasNumber = false;

  for (const token of tokens) {
    const numeric = Number(token);

    if (!Number.isNaN(numeric)) {
      if (pending !== null) total += pending;
      pending = numeric;
      hasNumber = true;
      continue;
    }

    const scale = SCALE_WORDS[token];

    if (scale !== undefined) {
      total += (pending ?? 1) * scale;
      pending = null;
      hasNumber = true;
      continue;
    }

    if (token !== "and" && token !== "aur" && token !== "اور") return null;
  }

  if (!hasNumber) return null;

  // Rounded to paisa, since amounts may carry up to two decimals
  return Math.round((total + (pending ?? 0)) * 100) / 100;
};

// Keeps the digits of a spoken phone number, turning +92 / 0092 into the local 0 prefix
export const normalizeSpokenPhone = (input: string): string => {
  const digits = toLatinDigits(input).replace(/\D/g, "");

  return digits.replace(/^(?:00)?92(?=3\d{9}$)/, "0");
};

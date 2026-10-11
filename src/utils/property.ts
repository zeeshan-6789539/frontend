import { CLOSING_STATUS_BY_PURPOSE } from "@/config/property";
import type { TPropertyPurpose, TPropertyStatus } from "@/types/property";

// A listing can only stay available or close the way its purpose allows
export const getAllowedListingStatuses = (
  purpose: TPropertyPurpose,
): readonly TPropertyStatus[] => ["available", CLOSING_STATUS_BY_PURPOSE[purpose]];

export const joinLocation = (...parts: (string | null | undefined)[]): string =>
  parts.filter(Boolean).join(", ");

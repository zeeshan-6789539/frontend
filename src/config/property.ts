import type { TBadgeVariant } from "@/types/ui";
import type {
  TPropertyPurpose,
  TPropertyStatus,
  TRequirementStatus,
} from "@/types/property";

export const PROPERTY_PURPOSES = ["sale", "rent"] as const;

export const PROPERTY_STATUSES = ["available", "sold", "rented"] as const;

export const REQUIREMENT_PURPOSES = ["buy", "rent"] as const;

export const REQUIREMENT_STATUSES = ["open", "matched", "closed"] as const;

// Mirrors the backend rule: a sale ends as sold, a rental as rented
export const CLOSING_STATUS_BY_PURPOSE: Record<TPropertyPurpose, TPropertyStatus> = {
  sale: "sold",
  rent: "rented",
};

export const PROPERTY_STATUS_BADGE: Record<TPropertyStatus, TBadgeVariant> = {
  available: "success",
  sold: "info",
  rented: "warning",
};

export const REQUIREMENT_STATUS_BADGE: Record<TRequirementStatus, TBadgeVariant> = {
  open: "info",
  matched: "success",
  closed: "muted",
};

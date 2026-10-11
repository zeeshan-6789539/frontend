import type { IApiError } from "@/types/api";
import type { IProperty } from "@/types/property";
import type { IPropertyRequirement } from "@/types/property-requirement";

export interface IDealerStats {
  activeListings: number;
  available: number;
  sold: number;
  rented: number;
  forSale: number;
  forRent: number;
  activeRequirements: number;
  open: number;
  matched: number;
  closed: number;
  activeContacts: number;
  recentProperties: IProperty[];
  recentRequirements: IPropertyRequirement[];
}

export interface IDealerStatsResult {
  stats: IDealerStats | null;
  isPending: boolean;
  error: IApiError | null;
}

"use client";

import { useContacts } from "@/features/contacts/hooks/use-contacts";
import { useProperties } from "@/features/properties/hooks/use-properties";
import { usePropertyRequirements } from "@/features/property-requirements/hooks/use-property-requirements";
import { RECENT_ITEMS_LIMIT } from "@/config/pagination";
import { getTotalItems } from "@/utils/api";
import type { IDealerStatsResult } from "@/features/dashboard/types/dealer-stats";

// Counters come from meta.totalItems with limit=1, so no extra backend route is needed
export const useDealerStats = (): IDealerStatsResult => {
  const recentProperties = useProperties({ page: 1, limit: RECENT_ITEMS_LIMIT, status: true });
  const available = useProperties({ page: 1, limit: 1, status: true, propertyStatus: "available" });
  const sold = useProperties({ page: 1, limit: 1, status: true, propertyStatus: "sold" });
  const rented = useProperties({ page: 1, limit: 1, status: true, propertyStatus: "rented" });
  const forSale = useProperties({ page: 1, limit: 1, status: true, purpose: "sale" });
  const forRent = useProperties({ page: 1, limit: 1, status: true, purpose: "rent" });

  const recentRequirements = usePropertyRequirements({
    page: 1,
    limit: RECENT_ITEMS_LIMIT,
    status: true,
  });
  const open = usePropertyRequirements({ page: 1, limit: 1, status: true, requirementStatus: "open" });
  const matched = usePropertyRequirements({
    page: 1,
    limit: 1,
    status: true,
    requirementStatus: "matched",
  });
  const closed = usePropertyRequirements({
    page: 1,
    limit: 1,
    status: true,
    requirementStatus: "closed",
  });

  const contacts = useContacts({ page: 1, limit: 1, status: true });

  const queries = [
    recentProperties,
    available,
    sold,
    rented,
    forSale,
    forRent,
    recentRequirements,
    open,
    matched,
    closed,
    contacts,
  ];

  const isPending = queries.some((query) => query.isPending);
  const error = queries.find((query) => query.isError)?.error ?? null;

  if (isPending || error) return { stats: null, isPending, error };

  return {
    isPending: false,
    error: null,
    stats: {
      activeListings: getTotalItems(recentProperties.data),
      available: getTotalItems(available.data),
      sold: getTotalItems(sold.data),
      rented: getTotalItems(rented.data),
      forSale: getTotalItems(forSale.data),
      forRent: getTotalItems(forRent.data),
      activeRequirements: getTotalItems(recentRequirements.data),
      open: getTotalItems(open.data),
      matched: getTotalItems(matched.data),
      closed: getTotalItems(closed.data),
      activeContacts: getTotalItems(contacts.data),
      recentProperties: recentProperties.data?.items ?? [],
      recentRequirements: recentRequirements.data?.items ?? [],
    },
  };
};

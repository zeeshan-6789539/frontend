"use client";

import { useMemo } from "react";
import { useCities } from "@/features/locations/hooks/use-cities";
import { MAX_PAGE_SIZE } from "@/config/pagination";
import { toSelectOptions } from "@/utils/options";

// Only active cities can hold an area
export const useCityOptions = (isEnabled = true) => {
  const { data, isPending } = useCities(
    { page: 1, limit: MAX_PAGE_SIZE, status: true },
    isEnabled,
  );

  return useMemo(
    () => ({
      options: toSelectOptions(data?.items ?? []),
      isPending,
    }),
    [data, isPending],
  );
};

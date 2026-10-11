"use client";

import { useMemo } from "react";
import { useFacilities } from "@/features/facilities/hooks/use-facilities";
import { MAX_PAGE_SIZE } from "@/config/pagination";
import { toSelectOptions } from "@/utils/options";

// Only active facilities can be linked to a listing or a requirement
export const useFacilityOptions = (isEnabled = true) => {
  const { data, isPending } = useFacilities(
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

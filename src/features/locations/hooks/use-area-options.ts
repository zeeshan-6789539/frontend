"use client";

import { useMemo } from "react";
import { useAreas } from "@/features/locations/hooks/use-areas";
import { MAX_PAGE_SIZE } from "@/config/pagination";
import { toSelectOptions } from "@/utils/options";

// Active areas of one city; nothing loads until a city is chosen
export const useAreaOptions = (cityId: string, isEnabled = true) => {
  const { data, isFetching } = useAreas(
    { page: 1, limit: MAX_PAGE_SIZE, cityId, status: true },
    isEnabled && cityId !== "",
  );

  return useMemo(
    () => ({
      // keepPreviousData would briefly show the old city's areas, so they are dropped here
      options: toSelectOptions(data?.items.filter((area) => area.cityId === cityId) ?? []),
      isPending: isFetching,
    }),
    [data, cityId, isFetching],
  );
};

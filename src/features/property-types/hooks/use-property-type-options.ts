"use client";

import { useMemo } from "react";
import { usePropertyTypes } from "@/features/property-types/hooks/use-property-types";
import { MAX_PAGE_SIZE } from "@/config/pagination";

// Only active types can be linked to a listing or a requirement
export const usePropertyTypeOptions = (isEnabled = true) => {
  const { data, isPending } = usePropertyTypes(
    { page: 1, limit: MAX_PAGE_SIZE, status: true },
    isEnabled,
  );

  return useMemo(
    () => ({
      options: (data?.items ?? []).map((type) => ({ value: type.id, label: type.name })),
      isPending,
    }),
    [data, isPending],
  );
};

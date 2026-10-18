"use client";

import { useMemo } from "react";
import { usePropertyTypes } from "@/features/property-types/hooks/use-property-types";
import { MAX_PAGE_SIZE } from "@/config/pagination";

// The company's type list, oldest first so the defaults keep their usual order
export const usePropertyTypeOptions = (isEnabled = true, activeOnly = true) => {
  const { data, isPending } = usePropertyTypes(
    { page: 1, limit: MAX_PAGE_SIZE, sortOrder: "asc", status: activeOnly ? true : undefined },
    isEnabled,
  );

  return useMemo(() => {
    const propertyTypes = data?.items ?? [];

    return {
      options: propertyTypes.map((propertyType) => ({
        value: propertyType.id,
        label: propertyType.name,
      })),
      isPending,
    };
  }, [data, isPending]);
};

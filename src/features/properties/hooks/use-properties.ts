"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { propertyKeys } from "@/features/properties/api/property-keys";
import { fetchProperties } from "@/features/properties/api/properties.api";
import type { IApiError, IPaginatedResult } from "@/types/api";
import type { IProperty, IPropertyQueryParams } from "@/types/property";

export const useProperties = (params: IPropertyQueryParams, isEnabled = true) =>
  useQuery<IPaginatedResult<IProperty>, IApiError>({
    queryKey: propertyKeys.list(params),
    queryFn: () => fetchProperties(params),
    enabled: isEnabled,
    // Keeps the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  });

"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { propertyTypeKeys } from "@/features/property-types/api/property-type-keys";
import { fetchPropertyTypes } from "@/features/property-types/api/property-types.api";
import type { IApiError, IPaginatedResult } from "@/types/api";
import type { IPropertyType, IPropertyTypeQueryParams } from "@/types/property-type";

export const usePropertyTypes = (params: IPropertyTypeQueryParams, isEnabled = true) =>
  useQuery<IPaginatedResult<IPropertyType>, IApiError>({
    queryKey: propertyTypeKeys.list(params),
    queryFn: () => fetchPropertyTypes(params),
    enabled: isEnabled,
    // Keeps the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  });

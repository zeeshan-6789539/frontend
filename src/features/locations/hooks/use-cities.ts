"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { cityKeys } from "@/features/locations/api/location-keys";
import { fetchCities } from "@/features/locations/api/cities.api";
import type { IApiError, IPaginatedResult } from "@/types/api";
import type { ICity, ICityQueryParams } from "@/types/city";

export const useCities = (params: ICityQueryParams, isEnabled = true) =>
  useQuery<IPaginatedResult<ICity>, IApiError>({
    queryKey: cityKeys.list(params),
    queryFn: () => fetchCities(params),
    enabled: isEnabled,
    // Keeps the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  });

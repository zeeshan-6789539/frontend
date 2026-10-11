"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { areaKeys } from "@/features/locations/api/location-keys";
import { fetchAreas } from "@/features/locations/api/areas.api";
import type { IApiError, IPaginatedResult } from "@/types/api";
import type { IArea, IAreaQueryParams } from "@/types/area";

export const useAreas = (params: IAreaQueryParams, isEnabled = true) =>
  useQuery<IPaginatedResult<IArea>, IApiError>({
    queryKey: areaKeys.list(params),
    queryFn: () => fetchAreas(params),
    enabled: isEnabled,
    // Keeps the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  });

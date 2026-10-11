"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { facilityKeys } from "@/features/facilities/api/facility-keys";
import { fetchFacilities } from "@/features/facilities/api/facilities.api";
import type { IApiError, IPaginatedResult } from "@/types/api";
import type { IFacility, IFacilityQueryParams } from "@/types/facility";

export const useFacilities = (params: IFacilityQueryParams, isEnabled = true) =>
  useQuery<IPaginatedResult<IFacility>, IApiError>({
    queryKey: facilityKeys.list(params),
    queryFn: () => fetchFacilities(params),
    enabled: isEnabled,
    // Keeps the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  });

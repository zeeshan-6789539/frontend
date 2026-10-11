"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import { fetchPropertyRequirements } from "@/features/property-requirements/api/property-requirements.api";
import type { IApiError, IPaginatedResult } from "@/types/api";
import type {
  IPropertyRequirement,
  IPropertyRequirementQueryParams,
} from "@/types/property-requirement";

export const usePropertyRequirements = (params: IPropertyRequirementQueryParams) =>
  useQuery<IPaginatedResult<IPropertyRequirement>, IApiError>({
    queryKey: propertyRequirementKeys.list(params),
    queryFn: () => fetchPropertyRequirements(params),
    // Keeps the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  });

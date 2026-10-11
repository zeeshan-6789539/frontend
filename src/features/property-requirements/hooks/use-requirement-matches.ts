"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import { fetchRequirementMatches } from "@/features/property-requirements/api/property-requirements.api";
import type { IApiError, IPaginatedResult } from "@/types/api";
import type { IProperty } from "@/types/property";
import type { IRequirementMatchQueryParams } from "@/types/property-requirement";

export const useRequirementMatches = (
  id: string | undefined,
  params: IRequirementMatchQueryParams,
) =>
  useQuery<IPaginatedResult<IProperty>, IApiError>({
    queryKey: propertyRequirementKeys.matches(id ?? "", params),
    queryFn: () => fetchRequirementMatches(id ?? "", params),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });

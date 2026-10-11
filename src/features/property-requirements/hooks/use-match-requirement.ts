"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/features/properties/api/property-keys";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import { matchPropertyRequirement } from "@/features/property-requirements/api/property-requirements.api";
import type { IApiError } from "@/types/api";
import type {
  IMatchRequirementArgs,
  IPropertyRequirement,
} from "@/types/property-requirement";

// Choosing a listing changes both the requirement and the property, so both caches refresh
export const useMatchRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation<IPropertyRequirement, IApiError, IMatchRequirementArgs>({
    mutationFn: ({ id, propertyId }) => matchPropertyRequirement(id, propertyId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: propertyRequirementKeys.all }),
        queryClient.invalidateQueries({ queryKey: propertyKeys.all }),
      ]),
  });
};

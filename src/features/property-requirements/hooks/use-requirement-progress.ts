"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import { updatePropertyRequirement } from "@/features/property-requirements/api/property-requirements.api";
import type { IApiError } from "@/types/api";
import type {
  IPropertyRequirement,
  IRequirementStatusChangeArgs,
} from "@/types/property-requirement";

// Moves a requirement between open, matched and closed without the full form
export const useRequirementProgress = () => {
  const queryClient = useQueryClient();

  return useMutation<IPropertyRequirement, IApiError, IRequirementStatusChangeArgs>({
    mutationFn: ({ id, requirementStatus }) =>
      updatePropertyRequirement(id, { requirementStatus }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: propertyRequirementKeys.all }),
  });
};

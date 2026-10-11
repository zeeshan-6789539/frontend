"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import {
  deactivatePropertyRequirement,
  restorePropertyRequirement,
} from "@/features/property-requirements/api/property-requirements.api";
import type { IApiError } from "@/types/api";
import type { IStatusChangeArgs } from "@/types/mutation";
import type { IPropertyRequirement } from "@/types/property-requirement";

export const usePropertyRequirementStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<IPropertyRequirement, IApiError, IStatusChangeArgs>({
    mutationFn: ({ id, nextStatus }) =>
      nextStatus ? restorePropertyRequirement(id) : deactivatePropertyRequirement(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: propertyRequirementKeys.all }),
  });
};

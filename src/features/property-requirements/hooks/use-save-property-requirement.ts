"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import {
  createPropertyRequirement,
  updatePropertyRequirement,
} from "@/features/property-requirements/api/property-requirements.api";
import type { IApiError } from "@/types/api";
import type {
  IPropertyRequirement,
  ISavePropertyRequirementArgs,
} from "@/types/property-requirement";

export const useSavePropertyRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation<IPropertyRequirement, IApiError, ISavePropertyRequirementArgs>({
    mutationFn: ({ id, payload }) =>
      id ? updatePropertyRequirement(id, payload) : createPropertyRequirement(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: propertyRequirementKeys.all }),
  });
};

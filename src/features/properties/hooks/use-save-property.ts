"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/features/properties/api/property-keys";
import { createProperty, updateProperty } from "@/features/properties/api/properties.api";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import type { IApiError } from "@/types/api";
import type { IProperty, ISavePropertyArgs } from "@/types/property";

export const useSaveProperty = () => {
  const queryClient = useQueryClient();

  return useMutation<IProperty, IApiError, ISavePropertyArgs>({
    mutationFn: ({ id, payload }) =>
      id ? updateProperty(id, payload) : createProperty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      // A new or changed listing can change a seeker's matches
      queryClient.invalidateQueries({ queryKey: propertyRequirementKeys.all });
    },
  });
};

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/features/properties/api/property-keys";
import { updateProperty } from "@/features/properties/api/properties.api";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import type { IApiError } from "@/types/api";
import type { IProperty, IPropertyStatusChangeArgs } from "@/types/property";

// Marks a listing available, sold or rented without opening the full form
export const usePropertyListingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<IProperty, IApiError, IPropertyStatusChangeArgs>({
    mutationFn: ({ id, propertyStatus }) => updateProperty(id, { propertyStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      queryClient.invalidateQueries({ queryKey: propertyRequirementKeys.all });
    },
  });
};

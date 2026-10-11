"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyTypeKeys } from "@/features/property-types/api/property-type-keys";
import {
  createPropertyType,
  updatePropertyType,
} from "@/features/property-types/api/property-types.api";
import { propertyKeys } from "@/features/properties/api/property-keys";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import type { IApiError } from "@/types/api";
import type { IPropertyType, ISavePropertyTypeArgs } from "@/types/property-type";

export const useSavePropertyType = () => {
  const queryClient = useQueryClient();

  return useMutation<IPropertyType, IApiError, ISavePropertyTypeArgs>({
    mutationFn: ({ id, payload }) =>
      id ? updatePropertyType(id, payload) : createPropertyType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyTypeKeys.all });
      // Listings and requirements show the type name, so a rename makes them stale
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      queryClient.invalidateQueries({ queryKey: propertyRequirementKeys.all });
    },
  });
};

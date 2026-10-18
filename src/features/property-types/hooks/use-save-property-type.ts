"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/features/properties/api/property-keys";
import { propertyTypeKeys } from "@/features/property-types/api/property-type-keys";
import {
  createPropertyType,
  updatePropertyType,
} from "@/features/property-types/api/property-types.api";
import type { IApiError } from "@/types/api";
import type { IPropertyType, ISavePropertyTypeArgs } from "@/types/property-type";

export const useSavePropertyType = () => {
  const queryClient = useQueryClient();

  return useMutation<IPropertyType, IApiError, ISavePropertyTypeArgs>({
    mutationFn: ({ id, payload }) =>
      id ? updatePropertyType(id, payload) : createPropertyType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyTypeKeys.all });
      // Properties show their type's name, so a rename makes those lists stale too
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    },
  });
};

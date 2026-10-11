"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyTypeKeys } from "@/features/property-types/api/property-type-keys";
import {
  deactivatePropertyType,
  restorePropertyType,
} from "@/features/property-types/api/property-types.api";
import type { IApiError } from "@/types/api";
import type { IStatusChangeArgs } from "@/types/mutation";
import type { IPropertyType } from "@/types/property-type";

export const usePropertyTypeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<IPropertyType, IApiError, IStatusChangeArgs>({
    mutationFn: ({ id, nextStatus }) =>
      nextStatus ? restorePropertyType(id) : deactivatePropertyType(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: propertyTypeKeys.all }),
  });
};

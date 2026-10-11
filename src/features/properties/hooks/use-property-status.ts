"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/features/properties/api/property-keys";
import { deactivateProperty, restoreProperty } from "@/features/properties/api/properties.api";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import type { IApiError } from "@/types/api";
import type { IStatusChangeArgs } from "@/types/mutation";
import type { IProperty } from "@/types/property";

export const usePropertyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<IProperty, IApiError, IStatusChangeArgs>({
    mutationFn: ({ id, nextStatus }) =>
      nextStatus ? restoreProperty(id) : deactivateProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      queryClient.invalidateQueries({ queryKey: propertyRequirementKeys.all });
    },
  });
};

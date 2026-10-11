"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { areaKeys, cityKeys } from "@/features/locations/api/location-keys";
import { createArea, updateArea } from "@/features/locations/api/areas.api";
import { propertyKeys } from "@/features/properties/api/property-keys";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import type { IApiError } from "@/types/api";
import type { IArea, ISaveAreaArgs } from "@/types/area";

export const useSaveArea = () => {
  const queryClient = useQueryClient();

  return useMutation<IArea, IApiError, ISaveAreaArgs>({
    mutationFn: ({ id, payload }) => (id ? updateArea(id, payload) : createArea(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.all });
      // Each city shows its active area count
      queryClient.invalidateQueries({ queryKey: cityKeys.all });
      // Listings and requirements show city and area names, so a rename makes them stale
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      queryClient.invalidateQueries({ queryKey: propertyRequirementKeys.all });
    },
  });
};

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { facilityKeys } from "@/features/facilities/api/facility-keys";
import {
  createFacility,
  updateFacility,
} from "@/features/facilities/api/facilities.api";
import { propertyKeys } from "@/features/properties/api/property-keys";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import type { IApiError } from "@/types/api";
import type { IFacility, ISaveFacilityArgs } from "@/types/facility";

export const useSaveFacility = () => {
  const queryClient = useQueryClient();

  return useMutation<IFacility, IApiError, ISaveFacilityArgs>({
    mutationFn: ({ id, payload }) =>
      id ? updateFacility(id, payload) : createFacility(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
      // Listings and requirements show facility names, so a rename makes them stale
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      queryClient.invalidateQueries({ queryKey: propertyRequirementKeys.all });
    },
  });
};

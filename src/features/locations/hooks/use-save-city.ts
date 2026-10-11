"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { areaKeys, cityKeys } from "@/features/locations/api/location-keys";
import { createCity, updateCity } from "@/features/locations/api/cities.api";
import { propertyKeys } from "@/features/properties/api/property-keys";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import type { IApiError } from "@/types/api";
import type { ICity, ISaveCityArgs } from "@/types/city";

export const useSaveCity = () => {
  const queryClient = useQueryClient();

  return useMutation<ICity, IApiError, ISaveCityArgs>({
    mutationFn: ({ id, payload }) => (id ? updateCity(id, payload) : createCity(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cityKeys.all });
      // Listings and requirements show city and area names, so a rename makes them stale
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      queryClient.invalidateQueries({ queryKey: propertyRequirementKeys.all });
      // Areas show their city's name, so a rename makes them stale
      queryClient.invalidateQueries({ queryKey: areaKeys.all });
    },
  });
};

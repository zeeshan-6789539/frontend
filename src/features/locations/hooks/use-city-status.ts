"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cityKeys } from "@/features/locations/api/location-keys";
import { deactivateCity, restoreCity } from "@/features/locations/api/cities.api";
import type { IApiError } from "@/types/api";
import type { IStatusChangeArgs } from "@/types/mutation";
import type { ICity } from "@/types/city";

export const useCityStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<ICity, IApiError, IStatusChangeArgs>({
    mutationFn: ({ id, nextStatus }) => (nextStatus ? restoreCity(id) : deactivateCity(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cityKeys.all }),
  });
};

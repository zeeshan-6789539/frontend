"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { areaKeys, cityKeys } from "@/features/locations/api/location-keys";
import { deactivateArea, restoreArea } from "@/features/locations/api/areas.api";
import type { IApiError } from "@/types/api";
import type { IStatusChangeArgs } from "@/types/mutation";
import type { IArea } from "@/types/area";

export const useAreaStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<IArea, IApiError, IStatusChangeArgs>({
    mutationFn: ({ id, nextStatus }) => (nextStatus ? restoreArea(id) : deactivateArea(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.all });
      queryClient.invalidateQueries({ queryKey: cityKeys.all });
    },
  });
};

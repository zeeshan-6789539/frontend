"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { facilityKeys } from "@/features/facilities/api/facility-keys";
import {
  deactivateFacility,
  restoreFacility,
} from "@/features/facilities/api/facilities.api";
import type { IApiError } from "@/types/api";
import type { IStatusChangeArgs } from "@/types/mutation";
import type { IFacility } from "@/types/facility";

export const useFacilityStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<IFacility, IApiError, IStatusChangeArgs>({
    mutationFn: ({ id, nextStatus }) =>
      nextStatus ? restoreFacility(id) : deactivateFacility(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: facilityKeys.all }),
  });
};

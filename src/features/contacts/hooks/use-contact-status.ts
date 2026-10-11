"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contactKeys } from "@/features/contacts/api/contact-keys";
import { deactivateContact, restoreContact } from "@/features/contacts/api/contacts.api";
import type { IApiError } from "@/types/api";
import type { IContact } from "@/types/contact";
import type { IStatusChangeArgs } from "@/types/mutation";

export const useContactStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<IContact, IApiError, IStatusChangeArgs>({
    mutationFn: ({ id, nextStatus }) =>
      nextStatus ? restoreContact(id) : deactivateContact(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
};

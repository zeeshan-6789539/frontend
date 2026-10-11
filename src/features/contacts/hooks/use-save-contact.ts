"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contactKeys } from "@/features/contacts/api/contact-keys";
import { createContact, updateContact } from "@/features/contacts/api/contacts.api";
import { propertyKeys } from "@/features/properties/api/property-keys";
import { propertyRequirementKeys } from "@/features/property-requirements/api/property-requirement-keys";
import type { IApiError } from "@/types/api";
import type { IContact, ISaveContactArgs } from "@/types/contact";

export const useSaveContact = () => {
  const queryClient = useQueryClient();

  return useMutation<IContact, IApiError, ISaveContactArgs>({
    mutationFn: ({ id, payload }) =>
      id ? updateContact(id, payload) : createContact(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
      // Owner and seeker names are shown on listings and requirements
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      queryClient.invalidateQueries({ queryKey: propertyRequirementKeys.all });
    },
  });
};

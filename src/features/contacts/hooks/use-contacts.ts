"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { contactKeys } from "@/features/contacts/api/contact-keys";
import { fetchContacts } from "@/features/contacts/api/contacts.api";
import type { IApiError, IPaginatedResult } from "@/types/api";
import type { IContact, IContactQueryParams } from "@/types/contact";

export const useContacts = (params: IContactQueryParams, isEnabled = true) =>
  useQuery<IPaginatedResult<IContact>, IApiError>({
    queryKey: contactKeys.list(params),
    queryFn: () => fetchContacts(params),
    enabled: isEnabled,
    // Keeps the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  });

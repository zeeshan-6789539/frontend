"use client";

import { useMemo } from "react";
import { useContacts } from "@/features/contacts/hooks/use-contacts";
import { MAX_PAGE_SIZE } from "@/config/pagination";

// The newest active contacts; the select's own search narrows them further
export const useContactOptions = (isEnabled = true) => {
  const { data, isPending } = useContacts(
    { page: 1, limit: MAX_PAGE_SIZE, status: true },
    isEnabled,
  );

  return useMemo(
    () => ({
      options: (data?.items ?? []).map((contact) => ({
        value: contact.id,
        label: `${contact.name} · ${contact.phone}`,
      })),
      isPending,
    }),
    [data, isPending],
  );
};

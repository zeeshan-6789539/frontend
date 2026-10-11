"use client";

import { useMemo, useState } from "react";
import { useCities } from "@/features/locations/hooks/use-cities";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { emptyToUndefined } from "@/utils/string";
import { toStatusValue } from "@/utils/status";
import { DEFAULT_PAGE_SIZE } from "@/config/pagination";
import type { ICityQueryParams } from "@/types/city";
import type { TStatusFilter } from "@/types/query-params";

// Search, status filter and page for the cities list, reset to page 1 on every filter change
export const useCityBrowser = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TStatusFilter>("all");
  const debouncedSearch = useDebouncedValue(searchTerm);

  const params = useMemo<ICityQueryParams>(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: emptyToUndefined(debouncedSearch),
      status: toStatusValue(statusFilter),
    }),
    [page, debouncedSearch, statusFilter],
  );

  const query = useCities(params);

  const changeSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const changeStatus = (value: TStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  return { query, searchTerm, statusFilter, changeSearch, changeStatus, setPage };
};

"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, MapPin, Pencil, Plus, Power, RotateCcw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/utils/api";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/format";
import type { TStatusFilter } from "@/types/query-params";
import type { ICitiesPanelProps } from "@/features/locations/types/location-components";

export const CitiesPanel = ({
  browser,
  selectedCityId,
  onSelect,
  onCreate,
  onEdit,
  onToggleStatus,
}: ICitiesPanelProps) => {
  const t = useTranslations("locations");
  const tCommon = useTranslations("common");
  const tFilters = useTranslations("filters");
  const locale = useLocale();
  const { data, isPending, isError, error, refetch } = browser.query;

  const statusOptions = [
    { value: "all", label: tFilters("allStatuses") },
    { value: "active", label: tCommon("active") },
    { value: "inactive", label: tCommon("deactivated") },
  ];

  return (
    <Card className="flex flex-col gap-4 p-0">
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold tracking-tight">{t("cities.title")}</h2>
          {data ? (
            <Badge variant="muted">{formatNumber(data.meta.totalItems, locale)}</Badge>
          ) : null}
        </div>
        <Button size="sm" onClick={onCreate}>
          <Plus className="h-4 w-4" aria-hidden />
          {t("cities.create")}
        </Button>
      </div>

      <div className="flex gap-2 px-5">
        <SearchInput
          value={browser.searchTerm}
          onChange={browser.changeSearch}
          label={tFilters("searchLabel")}
          placeholder={t("cities.searchPlaceholder")}
          className="min-w-0 flex-1"
        />
        <Select
          value={browser.statusFilter}
          onChange={(value) => browser.changeStatus(value as TStatusFilter)}
          options={statusOptions}
          aria-label={tFilters("statusLabel")}
          className="w-32 shrink-0"
        />
      </div>

      {isPending ? (
        <div className="space-y-2 px-5 pb-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="px-5 pb-5">
          <Alert>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{getApiErrorMessage(error, tCommon("error"))}</span>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                {tCommon("retry")}
              </Button>
            </div>
          </Alert>
        </div>
      ) : null}

      {data && data.items.length === 0 ? (
        <EmptyState
          title={t("cities.emptyTitle")}
          description={t("cities.emptySubtitle")}
          icon={<MapPin className="h-6 w-6" aria-hidden />}
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <ul className="divide-y divide-border border-t border-border">
            {data.items.map((city) => {
              const isSelected = city.id === selectedCityId;

              return (
                <li
                  key={city.id}
                  className={cn(
                    "flex items-center gap-1 border-s-2 pe-3 transition-colors",
                    isSelected
                      ? "border-primary bg-primary-soft"
                      : "border-transparent hover:bg-muted",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(city)}
                    aria-current={isSelected || undefined}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-3 ps-4 text-start"
                  >
                    <span
                      className={cn(
                        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary-soft text-primary-soft-foreground",
                      )}
                    >
                      <MapPin className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{city.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {t("cities.areaCount", { count: city.areaCount })}
                      </span>
                    </span>
                    {city.status ? null : <Badge variant="muted">{tCommon("deactivated")}</Badge>}
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                      aria-hidden
                    />
                  </button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(city)}
                    aria-label={t("cities.edit")}
                    title={t("cities.edit")}
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleStatus(city)}
                    aria-label={city.status ? t("cities.deactivate") : t("cities.restore")}
                    title={city.status ? t("cities.deactivate") : t("cities.restore")}
                  >
                    {city.status ? (
                      <Power className="h-4 w-4 text-danger" aria-hidden />
                    ) : (
                      <RotateCcw className="h-4 w-4 text-success" aria-hidden />
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>

          {data.meta.totalPages > 1 ? (
            <div className="px-5 pb-5">
              <Pagination meta={data.meta} onPageChange={browser.setPage} />
            </div>
          ) : (
            <div className="pb-1" />
          )}
        </>
      ) : null}
    </Card>
  );
};

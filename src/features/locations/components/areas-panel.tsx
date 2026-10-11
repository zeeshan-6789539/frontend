"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Map as MapIcon, MapPinned, Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaFormDialog } from "@/features/locations/components/area-form-dialog";
import { AreaList } from "@/features/locations/components/area-list";
import { AreaQuickAdd } from "@/features/locations/components/area-quick-add";
import { useAreaStatus } from "@/features/locations/hooks/use-area-status";
import { useAreas } from "@/features/locations/hooks/use-areas";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import { formatNumber } from "@/utils/format";
import { emptyToUndefined } from "@/utils/string";
import { toStatusValue } from "@/utils/status";
import { DEFAULT_PAGE_SIZE } from "@/config/pagination";
import type { IArea, IAreaQueryParams } from "@/types/area";
import type { TStatusFilter } from "@/types/query-params";
import type { IAreasPanelProps } from "@/features/locations/types/location-components";

export const AreasPanel = ({ city, onCreateCity }: IAreasPanelProps) => {
  const t = useTranslations("locations");
  const tCommon = useTranslations("common");
  const tFilters = useTranslations("filters");
  const locale = useLocale();
  const { showToast } = useToast();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TStatusFilter>("all");
  const [editingArea, setEditingArea] = useState<IArea | null>(null);
  const [statusTarget, setStatusTarget] = useState<IArea | null>(null);
  const [shownCityId, setShownCityId] = useState(city?.id);
  const debouncedSearch = useDebouncedValue(searchTerm);

  // Switching city starts its list from the top with no leftover filters
  if (city?.id !== shownCityId) {
    setShownCityId(city?.id);
    setPage(1);
    setSearchTerm("");
  }

  const params = useMemo<IAreaQueryParams>(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      cityId: city?.id,
      search: emptyToUndefined(debouncedSearch),
      status: toStatusValue(statusFilter),
    }),
    [page, city?.id, debouncedSearch, statusFilter],
  );

  const { data, isPending, isError, error, refetch } = useAreas(params, Boolean(city));
  const { mutate: changeStatus, isPending: isChangingStatus } = useAreaStatus();

  const statusOptions = [
    { value: "all", label: tFilters("allStatuses") },
    { value: "active", label: tCommon("active") },
    { value: "inactive", label: tCommon("deactivated") },
  ];

  const handleConfirmStatus = () => {
    if (!statusTarget) return;

    changeStatus(
      { id: statusTarget.id, nextStatus: !statusTarget.status },
      {
        onSuccess: (updated) => {
          showToast(
            updated.status
              ? t("areas.restored", { name: updated.name })
              : t("areas.deactivated", { name: updated.name }),
          );
          setStatusTarget(null);
        },
        onError: (mutationError) =>
          showToast(getApiErrorMessage(mutationError, tCommon("error")), "danger"),
      },
    );
  };

  if (!city) {
    return (
      <Card className="p-0">
        <EmptyState
          title={t("areas.noCityTitle")}
          description={t("areas.noCitySubtitle")}
          icon={<MapIcon className="h-6 w-6" aria-hidden />}
          action={
            <Button size="sm" onClick={onCreateCity}>
              <Plus className="h-4 w-4" aria-hidden />
              {t("cities.create")}
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground shadow-brand">
            <MapPinned className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold tracking-tight">
              {t("areas.title", { city: city.name })}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("areas.activeCount", { count: city.areaCount })}
            </p>
          </div>
        </div>
        <Badge variant={city.status ? "success" : "muted"}>
          {city.status ? tCommon("active") : tCommon("deactivated")}
        </Badge>
      </div>

      <AreaQuickAdd city={city} />

      <div className="flex flex-wrap gap-2 border-t border-border pt-4 sm:flex-nowrap">
        <SearchInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setPage(1);
          }}
          label={tFilters("searchLabel")}
          placeholder={t("areas.searchPlaceholder")}
          className="w-full min-w-0 sm:flex-1"
        />
        <Select
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value as TStatusFilter);
            setPage(1);
          }}
          options={statusOptions}
          aria-label={tFilters("statusLabel")}
          className="w-full shrink-0 sm:w-36"
        />
      </div>

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <Alert>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{getApiErrorMessage(error, tCommon("error"))}</span>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              {tCommon("retry")}
            </Button>
          </div>
        </Alert>
      ) : null}

      {data && data.items.length === 0 ? (
        <EmptyState
          title={t("areas.emptyTitle")}
          description={t("areas.emptySubtitle", { city: city.name })}
          icon={<MapPinned className="h-6 w-6" aria-hidden />}
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <div className="space-y-4">
          <AreaList
            areas={data.items}
            onEdit={setEditingArea}
            onToggleStatus={setStatusTarget}
          />
          {data.meta.totalPages > 1 ? (
            <Pagination meta={data.meta} onPageChange={setPage} />
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("areas.total", { count: formatNumber(data.meta.totalItems, locale) })}
            </p>
          )}
        </div>
      ) : null}

      <AreaFormDialog area={editingArea} onClose={() => setEditingArea(null)} />

      <ConfirmDialog
        isOpen={statusTarget !== null}
        title={statusTarget?.status ? t("areas.deactivateTitle") : t("areas.restoreTitle")}
        description={
          statusTarget?.status
            ? t("areas.deactivateConfirm", { name: statusTarget?.name ?? "" })
            : t("areas.restoreConfirm", { name: statusTarget?.name ?? "" })
        }
        confirmLabel={statusTarget?.status ? t("areas.deactivate") : t("areas.restore")}
        isDestructive={statusTarget?.status ?? false}
        isPending={isChangingStatus}
        onConfirm={handleConfirmStatus}
        onClose={() => setStatusTarget(null)}
      />
    </Card>
  );
};

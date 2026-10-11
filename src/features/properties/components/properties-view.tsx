"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Home, Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeading } from "@/components/layout/page-heading";
import { PropertiesTable } from "@/features/properties/components/properties-table";
import { PropertyFormDialog } from "@/features/properties/components/property-form-dialog";
import { useProperties } from "@/features/properties/hooks/use-properties";
import { usePropertyListingStatus } from "@/features/properties/hooks/use-property-listing-status";
import { usePropertyStatus } from "@/features/properties/hooks/use-property-status";
import { usePropertyTypeOptions } from "@/features/property-types/hooks/use-property-type-options";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import { emptyToUndefined } from "@/utils/string";
import { DEFAULT_PAGE_SIZE } from "@/config/pagination";
import { PROPERTY_PURPOSES, PROPERTY_STATUSES } from "@/config/property";
import type {
  IProperty,
  IPropertyQueryParams,
  TPropertyPurpose,
  TPropertyStatus,
} from "@/types/property";

export const PropertiesView = () => {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");
  const tFilters = useTranslations("filters");
  const { showToast } = useToast();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [listingStatusFilter, setListingStatusFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<IProperty | null>(null);
  const [statusTarget, setStatusTarget] = useState<IProperty | null>(null);

  const debouncedSearch = useDebouncedValue(searchTerm);

  // Every filter change starts from page 1, since the result can shrink
  const withPageReset =
    <TValue,>(setter: (value: TValue) => void) =>
    (value: TValue) => {
      setter(value);
      setPage(1);
    };

  const params = useMemo<IPropertyQueryParams>(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: emptyToUndefined(debouncedSearch),
      purpose: (emptyToUndefined(purposeFilter) as TPropertyPurpose | undefined),
      propertyTypeId: emptyToUndefined(typeFilter),
      propertyStatus: (emptyToUndefined(listingStatusFilter) as TPropertyStatus | undefined),
    }),
    [page, debouncedSearch, purposeFilter, typeFilter, listingStatusFilter],
  );

  const { data, isPending, isError, error, refetch } = useProperties(params);
  const { options: typeOptions } = usePropertyTypeOptions();
  const { mutate: changeStatus, isPending: isChangingStatus } = usePropertyStatus();
  const { mutate: changeListingStatus } = usePropertyListingStatus();

  const purposeOptions = [
    { value: "", label: t("allPurposes") },
    ...PROPERTY_PURPOSES.map((purpose) => ({ value: purpose, label: t(`purposes.${purpose}`) })),
  ];

  const typeFilterOptions = [{ value: "", label: t("allTypes") }, ...typeOptions];

  const listingStatusOptions = [
    { value: "", label: t("allPropertyStatuses") },
    ...PROPERTY_STATUSES.map((status) => ({
      value: status,
      label: t(`propertyStatuses.${status}`),
    })),
  ];

  const openCreateDialog = () => {
    setEditingProperty(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (property: IProperty) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const handleListingStatusChange = (property: IProperty, propertyStatus: TPropertyStatus) => {
    if (property.propertyStatus === propertyStatus) return;

    changeListingStatus(
      { id: property.id, propertyStatus },
      {
        onSuccess: (updated) =>
          showToast(
            t("propertyStatusChanged", {
              name: updated.title,
              status: t(`propertyStatuses.${updated.propertyStatus}`),
            }),
          ),
        onError: (mutationError) =>
          showToast(getApiErrorMessage(mutationError, tCommon("error")), "danger"),
      },
    );
  };

  const handleConfirmStatus = () => {
    if (!statusTarget) return;

    changeStatus(
      { id: statusTarget.id, nextStatus: !statusTarget.status },
      {
        onSuccess: (updated) => {
          showToast(
            updated.status
              ? t("restored", { name: updated.title })
              : t("deactivated", { name: updated.title }),
          );
          setStatusTarget(null);
        },
        onError: (mutationError) =>
          showToast(getApiErrorMessage(mutationError, tCommon("error")), "danger"),
      },
    );
  };

  return (
    <div className="space-y-4">
      <PageHeading title={t("title")}>
        <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
          <SearchInput
            value={searchTerm}
            onChange={withPageReset(setSearchTerm)}
            label={tFilters("searchLabel")}
            placeholder={t("searchPlaceholder")}
            className="w-full shrink-0 sm:w-56"
          />

          <Select
            value={purposeFilter}
            onChange={withPageReset(setPurposeFilter)}
            options={purposeOptions}
            aria-label={t("filterPurpose")}
            className="w-full shrink-0 sm:w-36"
          />

          <Select
            value={typeFilter}
            onChange={withPageReset(setTypeFilter)}
            options={typeFilterOptions}
            aria-label={t("filterType")}
            className="w-full shrink-0 sm:w-40"
          />

          <Select
            value={listingStatusFilter}
            onChange={withPageReset(setListingStatusFilter)}
            options={listingStatusOptions}
            aria-label={t("filterPropertyStatus")}
            className="w-full shrink-0 sm:w-48"
          />

          <Button className="shrink-0" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" aria-hidden />
            {t("create")}
          </Button>
        </div>
      </PageHeading>

      {isPending ? <Skeleton className="h-72" /> : null}

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
        <Card className="p-0">
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptySubtitle")}
            icon={<Home className="h-6 w-6" aria-hidden />}
            action={
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" aria-hidden />
                {t("create")}
              </Button>
            }
          />
        </Card>
      ) : null}

      {data && data.items.length > 0 ? (
        <div className="space-y-4">
          <PropertiesTable
            properties={data.items}
            onEdit={openEditDialog}
            onToggleStatus={setStatusTarget}
            onChangeListingStatus={handleListingStatusChange}
          />
          <Pagination meta={data.meta} onPageChange={setPage} />
        </div>
      ) : null}

      <PropertyFormDialog
        isOpen={isFormOpen}
        property={editingProperty}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        isOpen={statusTarget !== null}
        title={statusTarget?.status ? t("deactivateTitle") : t("restoreTitle")}
        description={
          statusTarget?.status
            ? t("deactivateConfirm", { name: statusTarget?.title ?? "" })
            : t("restoreConfirm", { name: statusTarget?.title ?? "" })
        }
        confirmLabel={statusTarget?.status ? t("deactivate") : t("restore")}
        isDestructive={statusTarget?.status ?? false}
        isPending={isChangingStatus}
        onConfirm={handleConfirmStatus}
        onClose={() => setStatusTarget(null)}
      />
    </div>
  );
};

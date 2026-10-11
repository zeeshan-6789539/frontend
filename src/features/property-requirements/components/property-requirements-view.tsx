"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ClipboardList, Plus } from "lucide-react";
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
import { PropertyRequirementFormDialog } from "@/features/property-requirements/components/property-requirement-form-dialog";
import { PropertyRequirementsTable } from "@/features/property-requirements/components/property-requirements-table";
import { RequirementMatchesDialog } from "@/features/property-requirements/components/requirement-matches-dialog";
import { usePropertyRequirements } from "@/features/property-requirements/hooks/use-property-requirements";
import { usePropertyRequirementStatus } from "@/features/property-requirements/hooks/use-property-requirement-status";
import { useRequirementProgress } from "@/features/property-requirements/hooks/use-requirement-progress";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import { emptyToUndefined } from "@/utils/string";
import { DEFAULT_PAGE_SIZE } from "@/config/pagination";
import { REQUIREMENT_PURPOSES, REQUIREMENT_STATUSES } from "@/config/property";
import type { TRequirementPurpose, TRequirementStatus } from "@/types/property";
import type {
  IPropertyRequirement,
  IPropertyRequirementQueryParams,
} from "@/types/property-requirement";

export const PropertyRequirementsView = () => {
  const t = useTranslations("requirements");
  const tCommon = useTranslations("common");
  const tFilters = useTranslations("filters");
  const { showToast } = useToast();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("");
  const [progressFilter, setProgressFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<IPropertyRequirement | null>(null);
  const [statusTarget, setStatusTarget] = useState<IPropertyRequirement | null>(null);
  const [matchesTarget, setMatchesTarget] = useState<IPropertyRequirement | null>(null);

  const debouncedSearch = useDebouncedValue(searchTerm);

  // Every filter change starts from page 1, since the result can shrink
  const withPageReset =
    <TValue,>(setter: (value: TValue) => void) =>
    (value: TValue) => {
      setter(value);
      setPage(1);
    };

  const params = useMemo<IPropertyRequirementQueryParams>(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: emptyToUndefined(debouncedSearch),
      purpose: emptyToUndefined(purposeFilter) as TRequirementPurpose | undefined,
      requirementStatus: emptyToUndefined(progressFilter) as TRequirementStatus | undefined,
    }),
    [page, debouncedSearch, purposeFilter, progressFilter],
  );

  const { data, isPending, isError, error, refetch } = usePropertyRequirements(params);
  const { mutate: changeStatus, isPending: isChangingStatus } = usePropertyRequirementStatus();
  const { mutate: changeProgress } = useRequirementProgress();

  const purposeOptions = [
    { value: "", label: t("allPurposes") },
    ...REQUIREMENT_PURPOSES.map((purpose) => ({
      value: purpose,
      label: t(`purposes.${purpose}`),
    })),
  ];

  const progressOptions = [
    { value: "", label: t("allRequirementStatuses") },
    ...REQUIREMENT_STATUSES.map((status) => ({
      value: status,
      label: t(`requirementStatuses.${status}`),
    })),
  ];

  const openCreateDialog = () => {
    setEditingRequirement(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (requirement: IPropertyRequirement) => {
    setEditingRequirement(requirement);
    setIsFormOpen(true);
  };

  const handleProgressChange = (
    requirement: IPropertyRequirement,
    requirementStatus: TRequirementStatus,
  ) => {
    if (requirement.requirementStatus === requirementStatus) return;

    changeProgress(
      { id: requirement.id, requirementStatus },
      {
        onSuccess: (updated) =>
          showToast(
            t("requirementStatusChanged", {
              name: updated.contactName,
              status: t(`requirementStatuses.${updated.requirementStatus}`),
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
              ? t("restored", { name: updated.contactName })
              : t("deactivated", { name: updated.contactName }),
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
            value={progressFilter}
            onChange={withPageReset(setProgressFilter)}
            options={progressOptions}
            aria-label={t("filterRequirementStatus")}
            className="w-full shrink-0 sm:w-56"
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
            icon={<ClipboardList className="h-6 w-6" aria-hidden />}
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
          <PropertyRequirementsTable
            requirements={data.items}
            onEdit={openEditDialog}
            onToggleStatus={setStatusTarget}
            onShowMatches={setMatchesTarget}
            onChangeProgress={handleProgressChange}
          />
          <Pagination meta={data.meta} onPageChange={setPage} />
        </div>
      ) : null}

      <PropertyRequirementFormDialog
        isOpen={isFormOpen}
        requirement={editingRequirement}
        onClose={() => setIsFormOpen(false)}
      />

      <RequirementMatchesDialog
        key={matchesTarget?.id ?? "closed"}
        requirement={matchesTarget}
        onClose={() => setMatchesTarget(null)}
      />

      <ConfirmDialog
        isOpen={statusTarget !== null}
        title={statusTarget?.status ? t("deactivateTitle") : t("restoreTitle")}
        description={
          statusTarget?.status
            ? t("deactivateConfirm", { name: statusTarget?.contactName ?? "" })
            : t("restoreConfirm", { name: statusTarget?.contactName ?? "" })
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

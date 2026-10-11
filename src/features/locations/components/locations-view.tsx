"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeading } from "@/components/layout/page-heading";
import { AreasPanel } from "@/features/locations/components/areas-panel";
import { CitiesPanel } from "@/features/locations/components/cities-panel";
import { CityFormDialog } from "@/features/locations/components/city-form-dialog";
import { useCityBrowser } from "@/features/locations/hooks/use-city-browser";
import { useCityStatus } from "@/features/locations/hooks/use-city-status";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import type { ICity } from "@/types/city";

export const LocationsView = () => {
  const t = useTranslations("locations");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const browser = useCityBrowser();

  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<ICity | null>(null);
  const [statusTarget, setStatusTarget] = useState<ICity | null>(null);
  const { mutate: changeStatus, isPending: isChangingStatus } = useCityStatus();

  // Falls back to the first listed city, so the areas pane is never blank while cities exist
  const cities = browser.query.data?.items ?? [];
  const selectedCity = cities.find((city) => city.id === selectedCityId) ?? cities[0] ?? null;

  const openCreateDialog = () => {
    setEditingCity(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (city: ICity) => {
    setEditingCity(city);
    setIsFormOpen(true);
  };

  const handleConfirmStatus = () => {
    if (!statusTarget) return;

    changeStatus(
      { id: statusTarget.id, nextStatus: !statusTarget.status },
      {
        onSuccess: (updated) => {
          showToast(
            updated.status
              ? t("cities.restored", { name: updated.name })
              : t("cities.deactivated", { name: updated.name }),
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
      <PageHeading title={t("title")} description={t("subtitle")} />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <CitiesPanel
          browser={browser}
          selectedCityId={selectedCity?.id ?? null}
          onSelect={(city) => setSelectedCityId(city.id)}
          onCreate={openCreateDialog}
          onEdit={openEditDialog}
          onToggleStatus={setStatusTarget}
        />
        <AreasPanel city={selectedCity} onCreateCity={openCreateDialog} />
      </div>

      <CityFormDialog
        isOpen={isFormOpen}
        city={editingCity}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        isOpen={statusTarget !== null}
        title={statusTarget?.status ? t("cities.deactivateTitle") : t("cities.restoreTitle")}
        description={
          statusTarget?.status
            ? t("cities.deactivateConfirm", { name: statusTarget?.name ?? "" })
            : t("cities.restoreConfirm", { name: statusTarget?.name ?? "" })
        }
        confirmLabel={statusTarget?.status ? t("cities.deactivate") : t("cities.restore")}
        isDestructive={statusTarget?.status ?? false}
        isPending={isChangingStatus}
        onConfirm={handleConfirmStatus}
        onClose={() => setStatusTarget(null)}
      />
    </div>
  );
};

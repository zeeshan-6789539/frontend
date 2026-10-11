"use client";

import { useEffect, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormGrid } from "@/components/ui/form-grid";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { areaSchema } from "@/features/locations/schemas/location-schemas";
import { useCityOptions } from "@/features/locations/hooks/use-city-options";
import { useSaveArea } from "@/features/locations/hooks/use-save-area";
import { useFormState } from "@/hooks/use-form-state";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import { withMissingOptions } from "@/utils/options";
import { toTranslatedFieldErrors } from "@/utils/zod";
import type { IArea, IAreaFormValues } from "@/types/area";
import type { IAreaFormDialogProps } from "@/features/locations/types/location-components";

const toFormValues = (area: IArea | null): IAreaFormValues => ({
  cityId: area?.cityId ?? "",
  name: area?.name ?? "",
  status: area?.status ?? true,
});

// Areas are added inline; this dialog renames one, moves it to another city or changes its status
export const AreaFormDialog = ({ area, onClose }: IAreaFormDialogProps) => {
  const t = useTranslations("locations");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const isOpen = area !== null;
  const { values, errors, setValue, setErrors, reset } = useFormState(toFormValues(area));
  const { mutate, isPending, error, reset: resetMutation } = useSaveArea();
  const { options: cityOptions, isPending: isLoadingCities } = useCityOptions(isOpen);

  useEffect(() => {
    if (!area) return;

    reset(toFormValues(area));
    resetMutation();
  }, [area, reset, resetMutation]);

  const statusOptions = [
    { value: "true", label: tCommon("active") },
    { value: "false", label: tCommon("deactivated") },
  ];

  // The current city stays listed even if it was deactivated since
  const options = area
    ? withMissingOptions(cityOptions, [{ value: area.cityId, label: area.cityName }])
    : cityOptions;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!area) return;

    const parsed = areaSchema.safeParse({
      cityId: values.cityId,
      name: values.name.trim(),
      status: values.status,
    });

    if (!parsed.success) {
      setErrors(
        toTranslatedFieldErrors<IAreaFormValues>(parsed.error, (key) => t(`errors.${key}`)),
      );
      return;
    }

    mutate(
      { id: area.id, payload: parsed.data },
      {
        onSuccess: (saved) => {
          showToast(t("areas.updated", { name: saved.name }));
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title={t("areas.editTitle")}
      description={t("areas.editSubtitle")}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" form="area-form" isLoading={isPending}>
            {tCommon("save")}
          </Button>
        </>
      }
    >
      <form id="area-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {error ? <Alert>{getApiErrorMessage(error, tCommon("error"))}</Alert> : null}

        <FormGrid>
          <FormField id="area-name" label={t("fields.areaName")} error={errors.name}>
            <Input
              id="area-name"
              value={values.name}
              onChange={(event) => setValue("name", event.target.value)}
              hasError={Boolean(errors.name)}
              disabled={isPending}
              autoFocus
            />
          </FormField>

          <FormField
            id="area-city"
            label={t("fields.city")}
            error={errors.cityId}
            hint={t("areas.moveHint")}
          >
            <Select
              id="area-city"
              value={values.cityId}
              onChange={(value) => setValue("cityId", value)}
              options={options}
              hasError={Boolean(errors.cityId)}
              disabled={isPending || isLoadingCities}
            />
          </FormField>

          <FormField id="area-status" label={t("fields.status")}>
            <Select
              id="area-status"
              value={String(values.status)}
              onChange={(value) => setValue("status", value === "true")}
              options={statusOptions}
              disabled={isPending}
            />
          </FormField>
        </FormGrid>
      </form>
    </Modal>
  );
};

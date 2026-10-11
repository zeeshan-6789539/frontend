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
import { citySchema } from "@/features/locations/schemas/location-schemas";
import { useSaveCity } from "@/features/locations/hooks/use-save-city";
import { useFormState } from "@/hooks/use-form-state";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import { toTranslatedFieldErrors } from "@/utils/zod";
import type { ICity, ICityFormValues } from "@/types/city";
import type { ICityFormDialogProps } from "@/features/locations/types/location-components";

const toFormValues = (city: ICity | null): ICityFormValues => ({
  name: city?.name ?? "",
  status: city?.status ?? true,
});

export const CityFormDialog = ({ isOpen, city, onClose }: ICityFormDialogProps) => {
  const t = useTranslations("locations");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const { values, errors, setValue, setErrors, reset } = useFormState(toFormValues(city));
  const { mutate, isPending, error, reset: resetMutation } = useSaveCity();

  useEffect(() => {
    if (!isOpen) return;

    reset(toFormValues(city));
    resetMutation();
  }, [isOpen, city, reset, resetMutation]);

  const statusOptions = [
    { value: "true", label: tCommon("active") },
    { value: "false", label: tCommon("deactivated") },
  ];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = citySchema.safeParse({ name: values.name.trim(), status: values.status });

    if (!parsed.success) {
      setErrors(
        toTranslatedFieldErrors<ICityFormValues>(parsed.error, (key) => t(`errors.${key}`)),
      );
      return;
    }

    mutate(
      { id: city?.id, payload: parsed.data },
      {
        onSuccess: (saved) => {
          showToast(
            city
              ? t("cities.updated", { name: saved.name })
              : t("cities.created", { name: saved.name }),
          );
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title={city ? t("cities.editTitle") : t("cities.createTitle")}
      description={city ? t("cities.editSubtitle") : t("cities.createSubtitle")}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" form="city-form" isLoading={isPending}>
            {tCommon("save")}
          </Button>
        </>
      }
    >
      <form id="city-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {error ? <Alert>{getApiErrorMessage(error, tCommon("error"))}</Alert> : null}

        <FormGrid>
          <FormField id="city-name" label={t("fields.cityName")} error={errors.name}>
            <Input
              id="city-name"
              value={values.name}
              onChange={(event) => setValue("name", event.target.value)}
              placeholder={t("cities.namePlaceholder")}
              hasError={Boolean(errors.name)}
              disabled={isPending}
              autoFocus
            />
          </FormField>

          <FormField id="city-status" label={t("fields.status")}>
            <Select
              id="city-status"
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

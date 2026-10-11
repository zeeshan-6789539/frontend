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
import { facilitySchema } from "@/features/facilities/schemas/facility-schema";
import { useSaveFacility } from "@/features/facilities/hooks/use-save-facility";
import { useFormState } from "@/hooks/use-form-state";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import { toTranslatedFieldErrors } from "@/utils/zod";
import type { IFacility, IFacilityFormValues } from "@/types/facility";
import type { IFacilityFormDialogProps } from "@/features/facilities/types/facility-components";

const toFormValues = (facility: IFacility | null): IFacilityFormValues => ({
  name: facility?.name ?? "",
  status: facility?.status ?? true,
});

export const FacilityFormDialog = ({
  isOpen,
  facility,
  onClose,
}: IFacilityFormDialogProps) => {
  const t = useTranslations("facilities");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const { values, errors, setValue, setErrors, reset } = useFormState(
    toFormValues(facility),
  );
  const { mutate, isPending, error, reset: resetMutation } = useSaveFacility();

  useEffect(() => {
    if (!isOpen) return;

    reset(toFormValues(facility));
    resetMutation();
  }, [isOpen, facility, reset, resetMutation]);

  const statusOptions = [
    { value: "true", label: tCommon("active") },
    { value: "false", label: tCommon("deactivated") },
  ];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = facilitySchema.safeParse({
      name: values.name.trim(),
      status: values.status,
    });

    if (!parsed.success) {
      setErrors(
        toTranslatedFieldErrors<IFacilityFormValues>(parsed.error, (key) =>
          t(`errors.${key}`),
        ),
      );
      return;
    }

    mutate(
      { id: facility?.id, payload: parsed.data },
      {
        onSuccess: (saved) => {
          showToast(
            facility
              ? t("updated", { name: saved.name })
              : t("created", { name: saved.name }),
          );
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title={facility ? t("editTitle") : t("createTitle")}
      description={facility ? t("editSubtitle") : t("createSubtitle")}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" form="facility-form" isLoading={isPending}>
            {tCommon("save")}
          </Button>
        </>
      }
    >
      <form id="facility-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {error ? <Alert>{getApiErrorMessage(error, tCommon("error"))}</Alert> : null}

        <FormGrid>
          <FormField id="name" label={t("fields.name")} error={errors.name}>
            <Input
              id="name"
              value={values.name}
              onChange={(event) => setValue("name", event.target.value)}
              hasError={Boolean(errors.name)}
              disabled={isPending}
              autoFocus
            />
          </FormField>

          <FormField id="status" label={t("fields.status")}>
            <Select
              id="status"
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

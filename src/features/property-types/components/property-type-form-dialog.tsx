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
import { propertyTypeSchema } from "@/features/property-types/schemas/property-type-schema";
import { useSavePropertyType } from "@/features/property-types/hooks/use-save-property-type";
import { useFormState } from "@/hooks/use-form-state";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import { toTranslatedFieldErrors } from "@/utils/zod";
import type { IPropertyType, IPropertyTypeFormValues } from "@/types/property-type";
import type { IPropertyTypeFormDialogProps } from "@/features/property-types/types/property-type-components";

const toFormValues = (propertyType: IPropertyType | null): IPropertyTypeFormValues => ({
  name: propertyType?.name ?? "",
  status: propertyType?.status ?? true,
});

export const PropertyTypeFormDialog = ({
  isOpen,
  propertyType,
  onClose,
}: IPropertyTypeFormDialogProps) => {
  const t = useTranslations("propertyTypes");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const { values, errors, setValue, setErrors, reset } = useFormState(
    toFormValues(propertyType),
  );
  const { mutate, isPending, error, reset: resetMutation } = useSavePropertyType();

  useEffect(() => {
    if (!isOpen) return;

    reset(toFormValues(propertyType));
    resetMutation();
  }, [isOpen, propertyType, reset, resetMutation]);

  const statusOptions = [
    { value: "true", label: tCommon("active") },
    { value: "false", label: tCommon("deactivated") },
  ];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = propertyTypeSchema.safeParse({
      name: values.name.trim(),
      status: values.status,
    });

    if (!parsed.success) {
      setErrors(
        toTranslatedFieldErrors<IPropertyTypeFormValues>(parsed.error, (key) =>
          t(`errors.${key}`),
        ),
      );
      return;
    }

    mutate(
      { id: propertyType?.id, payload: parsed.data },
      {
        onSuccess: (saved) => {
          showToast(
            propertyType
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
      title={propertyType ? t("editTitle") : t("createTitle")}
      description={propertyType ? t("editSubtitle") : t("createSubtitle")}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" form="property-type-form" isLoading={isPending}>
            {tCommon("save")}
          </Button>
        </>
      }
    >
      <form id="property-type-form" onSubmit={handleSubmit} noValidate className="space-y-4">
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

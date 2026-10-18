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
import { DEFAULT_RENT_DUE_DAY, RENT_DUE_DAYS } from "@/config/property";
import { propertySchema } from "@/features/properties/schemas/property-schema";
import { useSaveProperty } from "@/features/properties/hooks/use-save-property";
import { usePropertyTypeOptions } from "@/features/property-types/hooks/use-property-type-options";
import { useFormState } from "@/hooks/use-form-state";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import { withMissingOptions } from "@/utils/options";
import { toTranslatedFieldErrors } from "@/utils/zod";
import type { IProperty, IPropertyFormValues } from "@/types/property";
import type { IPropertyFormDialogProps } from "@/features/properties/types/property-components";

const toFormValues = (property: IProperty | null): IPropertyFormValues => ({
  name: property?.name ?? "",
  addressLine1: property?.addressLine1 ?? "",
  city: property?.city ?? "",
  propertyTypeId: property?.propertyTypeId ?? "",
  rentDueDay: property?.rentDueDay ?? DEFAULT_RENT_DUE_DAY,
  status: property?.status ?? true,
});

const toPayload = (values: IPropertyFormValues) => ({
  name: values.name.trim(),
  addressLine1: values.addressLine1.trim(),
  city: values.city.trim(),
  propertyTypeId: values.propertyTypeId,
  rentDueDay: values.rentDueDay,
  status: values.status,
});

export const PropertyFormDialog = ({
  isOpen,
  property,
  onClose,
}: IPropertyFormDialogProps) => {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");
  const tTypes = useTranslations("propertyTypes");
  const { showToast } = useToast();
  const { options: activeTypeOptions, isPending: isTypesPending } = usePropertyTypeOptions(isOpen);
  const { values, errors, setValue, setErrors, reset } = useFormState(
    toFormValues(property),
  );
  const { mutate, isPending, error, reset: resetMutation } = useSaveProperty();

  useEffect(() => {
    if (!isOpen) return;

    reset(toFormValues(property));
    resetMutation();
  }, [isOpen, property, reset, resetMutation]);

  const statusOptions = [
    { value: "true", label: tCommon("active") },
    { value: "false", label: tCommon("deactivated") },
  ];

  // A property may keep a type that was deactivated after it was assigned
  const propertyTypeOptions = withMissingOptions(
    activeTypeOptions,
    property
      ? [
          {
            value: property.propertyTypeId,
            label: tTypes("inactiveOption", { name: property.propertyTypeName }),
          },
        ]
      : [],
  );
  const hasNoTypes = !isTypesPending && propertyTypeOptions.length === 0;

  const rentDueDayOptions = RENT_DUE_DAYS.map((day) => ({
    value: String(day),
    label: t("rentDueDayOption", { day }),
  }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = propertySchema.safeParse(toPayload(values));

    if (!parsed.success) {
      setErrors(
        toTranslatedFieldErrors<IPropertyFormValues>(parsed.error, (key) =>
          t(`errors.${key}`),
        ),
      );
      return;
    }

    mutate(
      { id: property?.id, payload: parsed.data },
      {
        onSuccess: (saved) => {
          showToast(
            property ? t("updated", { name: saved.name }) : t("created", { name: saved.name }),
          );
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title={property ? t("editTitle") : t("createTitle")}
      description={property ? t("editSubtitle") : t("createSubtitle")}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" form="property-form" isLoading={isPending}>
            {tCommon("save")}
          </Button>
        </>
      }
    >
      <form id="property-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {error ? <Alert>{getApiErrorMessage(error, tCommon("error"))}</Alert> : null}

        <FormGrid>
          {property ? (
            <FormField id="propertyNumber" label={t("fields.propertyNumber")}>
              <Input id="propertyNumber" value={property.propertyNumber} disabled />
            </FormField>
          ) : null}

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

          <FormField
            id="propertyTypeId"
            label={t("fields.propertyType")}
            error={errors.propertyTypeId}
            hint={hasNoTypes ? t("noPropertyTypes") : undefined}
          >
            <Select
              id="propertyTypeId"
              value={values.propertyTypeId}
              onChange={(value) => setValue("propertyTypeId", value)}
              options={propertyTypeOptions}
              placeholder={t("propertyTypePlaceholder")}
              hasError={Boolean(errors.propertyTypeId)}
              disabled={isPending || isTypesPending}
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

          <FormField
            id="addressLine1"
            label={t("fields.addressLine1")}
            error={errors.addressLine1}
          >
            <Input
              id="addressLine1"
              value={values.addressLine1}
              onChange={(event) => setValue("addressLine1", event.target.value)}
              hasError={Boolean(errors.addressLine1)}
              disabled={isPending}
            />
          </FormField>

          <FormField id="city" label={t("fields.city")} error={errors.city}>
            <Input
              id="city"
              value={values.city}
              onChange={(event) => setValue("city", event.target.value)}
              hasError={Boolean(errors.city)}
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="rentDueDay"
            label={t("fields.rentDueDay")}
            error={errors.rentDueDay}
          >
            <Select
              id="rentDueDay"
              value={String(values.rentDueDay)}
              onChange={(value) => setValue("rentDueDay", Number(value))}
              options={rentDueDayOptions}
              hasError={Boolean(errors.rentDueDay)}
              disabled={isPending}
            />
          </FormField>
        </FormGrid>
      </form>
    </Modal>
  );
};

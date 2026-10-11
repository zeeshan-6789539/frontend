"use client";

import { useEffect, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormGrid } from "@/components/ui/form-grid";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { REQUIREMENT_PURPOSES, REQUIREMENT_STATUSES } from "@/config/property";
import { useContactOptions } from "@/features/contacts/hooks/use-contact-options";
import { useFacilityOptions } from "@/features/facilities/hooks/use-facility-options";
import { useAreaOptions } from "@/features/locations/hooks/use-area-options";
import { useCityOptions } from "@/features/locations/hooks/use-city-options";
import { useSavePropertyRequirement } from "@/features/property-requirements/hooks/use-save-property-requirement";
import { propertyRequirementSchema } from "@/features/property-requirements/schemas/property-requirement-schema";
import { usePropertyTypeOptions } from "@/features/property-types/hooks/use-property-type-options";
import { useFormState } from "@/hooks/use-form-state";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import { toNumberInput, toOptionalNumber } from "@/utils/number";
import { toSelectOptions, withMissingOptions } from "@/utils/options";
import { emptyToNull } from "@/utils/string";
import { toTranslatedFieldErrors } from "@/utils/zod";
import type {
  IPropertyRequirement,
  IPropertyRequirementFormValues,
} from "@/types/property-requirement";
import type { TRequirementPurpose, TRequirementStatus } from "@/types/property";
import type { IPropertyRequirementFormDialogProps } from "@/features/property-requirements/types/property-requirement-components";

const toFormValues = (
  requirement: IPropertyRequirement | null,
): IPropertyRequirementFormValues => ({
  contactId: requirement?.contactId ?? "",
  propertyTypeId: requirement?.propertyTypeId ?? "",
  purpose: requirement?.purpose ?? "rent",
  budgetMin: toNumberInput(requirement?.budgetMin),
  budgetMax: toNumberInput(requirement?.budgetMax),
  preferredCityId: requirement?.preferredCityId ?? "",
  preferredAreaIds: requirement?.preferredAreas.map((area) => area.id) ?? [],
  facilityIds: requirement?.facilities.map((facility) => facility.id) ?? [],
  notes: requirement?.notes ?? "",
  requirementStatus: requirement?.requirementStatus ?? "open",
  status: requirement?.status ?? true,
});

const toPayload = (values: IPropertyRequirementFormValues) => ({
  contactId: values.contactId,
  propertyTypeId: emptyToNull(values.propertyTypeId),
  purpose: values.purpose,
  budgetMin: toOptionalNumber(values.budgetMin),
  budgetMax: toOptionalNumber(values.budgetMax),
  preferredCityId: emptyToNull(values.preferredCityId),
  preferredAreaIds: values.preferredAreaIds,
  facilityIds: values.facilityIds,
  notes: emptyToNull(values.notes),
  requirementStatus: values.requirementStatus,
  status: values.status,
});

export const PropertyRequirementFormDialog = ({
  isOpen,
  requirement,
  onClose,
}: IPropertyRequirementFormDialogProps) => {
  const t = useTranslations("requirements");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const { options: contactOptions } = useContactOptions(isOpen);
  const { options: typeOptions } = usePropertyTypeOptions(isOpen);
  const { options: facilityOptions } = useFacilityOptions(isOpen);
  const { options: cityOptions } = useCityOptions(isOpen);
  const { values, errors, setValue, setErrors, reset } = useFormState(
    toFormValues(requirement),
  );
  const { options: areaOptions, isPending: isLoadingAreas } = useAreaOptions(
    values.preferredCityId,
    isOpen,
  );
  const { mutate, isPending, error, reset: resetMutation } = useSavePropertyRequirement();

  useEffect(() => {
    if (!isOpen) return;

    reset(toFormValues(requirement));
    resetMutation();
  }, [isOpen, requirement, reset, resetMutation]);

  const purposeOptions = REQUIREMENT_PURPOSES.map((purpose) => ({
    value: purpose,
    label: t(`purposes.${purpose}`),
  }));

  const progressOptions = REQUIREMENT_STATUSES.map((status) => ({
    value: status,
    label: t(`requirementStatuses.${status}`),
  }));

  const typeSelectOptions = [{ value: "", label: t("anyType") }, ...typeOptions];

  // A facility deactivated after it was picked still shows, so it is not silently dropped
  // The saved city and areas stay listed even if they were deactivated since
  const citySelectOptions = [
    { value: "", label: t("anyCity") },
    ...withMissingOptions(
      cityOptions,
      requirement?.preferredCityId
        ? [{ value: requirement.preferredCityId, label: requirement.preferredCity ?? "" }]
        : [],
    ),
  ];
  const areaSelectOptions = withMissingOptions(
    areaOptions,
    requirement && requirement.preferredCityId === values.preferredCityId
      ? toSelectOptions(requirement.preferredAreas)
      : [],
  );

  // Areas belong to one city, so changing the city clears them
  const handleCityChange = (cityId: string) => {
    setValue("preferredCityId", cityId);
    setValue("preferredAreaIds", []);
  };

  const facilitySelectOptions = withMissingOptions(
    facilityOptions,
    toSelectOptions(requirement?.facilities ?? []),
  );

  const statusOptions = [
    { value: "true", label: tCommon("active") },
    { value: "false", label: tCommon("deactivated") },
  ];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = propertyRequirementSchema.safeParse(toPayload(values));

    if (!parsed.success) {
      setErrors(
        toTranslatedFieldErrors<IPropertyRequirementFormValues>(parsed.error, (key) =>
          t(`errors.${key}`),
        ),
      );
      return;
    }

    mutate(
      { id: requirement?.id, payload: parsed.data },
      {
        onSuccess: (saved) => {
          showToast(
            requirement
              ? t("updated", { name: saved.contactName })
              : t("created", { name: saved.contactName }),
          );
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title={requirement ? t("editTitle") : t("createTitle")}
      description={requirement ? t("editSubtitle") : t("createSubtitle")}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" form="requirement-form" isLoading={isPending}>
            {tCommon("save")}
          </Button>
        </>
      }
    >
      <form id="requirement-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {error ? <Alert>{getApiErrorMessage(error, tCommon("error"))}</Alert> : null}

        <FormGrid>
          <FormField
            id="contactId"
            label={t("fields.seeker")}
            error={errors.contactId}
            hint={t("seekerHint")}
          >
            <Select
              id="contactId"
              value={values.contactId}
              onChange={(value) => setValue("contactId", value)}
              options={contactOptions}
              placeholder={t("selectSeeker")}
              hasError={Boolean(errors.contactId)}
              disabled={isPending}
            />
          </FormField>

          <FormField id="purpose" label={t("fields.purpose")}>
            <Select
              id="purpose"
              value={values.purpose}
              onChange={(value) => setValue("purpose", value as TRequirementPurpose)}
              options={purposeOptions}
              disabled={isPending}
            />
          </FormField>

          <FormField id="propertyTypeId" label={t("fields.propertyType")}>
            <Select
              id="propertyTypeId"
              value={values.propertyTypeId}
              onChange={(value) => setValue("propertyTypeId", value)}
              options={typeSelectOptions}
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="facilityIds"
            label={t("fields.facilities")}
            error={errors.facilityIds}
            hint={t("facilitiesHint")}
            className="sm:col-span-2 lg:col-span-3"
          >
            <MultiSelect
              id="facilityIds"
              values={values.facilityIds}
              onChange={(facilityIds) => setValue("facilityIds", facilityIds)}
              options={facilitySelectOptions}
              placeholder={t("selectFacilities")}
              hasError={Boolean(errors.facilityIds)}
              disabled={isPending}
            />
          </FormField>

          <FormField id="budgetMin" label={t("fields.budgetMin")} error={errors.budgetMin}>
            <Input
              id="budgetMin"
              value={values.budgetMin}
              onChange={(event) => setValue("budgetMin", event.target.value)}
              hasError={Boolean(errors.budgetMin)}
              disabled={isPending}
              inputMode="numeric"
            />
          </FormField>

          <FormField id="budgetMax" label={t("fields.budgetMax")} error={errors.budgetMax}>
            <Input
              id="budgetMax"
              value={values.budgetMax}
              onChange={(event) => setValue("budgetMax", event.target.value)}
              hasError={Boolean(errors.budgetMax)}
              disabled={isPending}
              inputMode="numeric"
            />
          </FormField>

          <FormField
            id="preferredCityId"
            label={t("fields.preferredCity")}
            error={errors.preferredCityId}
          >
            <Select
              id="preferredCityId"
              value={values.preferredCityId}
              onChange={handleCityChange}
              options={citySelectOptions}
              placeholder={t("anyCity")}
              hasError={Boolean(errors.preferredCityId)}
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="preferredAreaIds"
            label={t("fields.preferredAreas")}
            error={errors.preferredAreaIds}
            hint={values.preferredCityId ? t("areasHint") : t("areasNeedCityHint")}
            className="sm:col-span-2"
          >
            <MultiSelect
              id="preferredAreaIds"
              values={values.preferredAreaIds}
              onChange={(areaIds) => setValue("preferredAreaIds", areaIds)}
              options={areaSelectOptions}
              placeholder={values.preferredCityId ? t("anyArea") : t("selectCityFirst")}
              hasError={Boolean(errors.preferredAreaIds)}
              disabled={isPending || !values.preferredCityId || isLoadingAreas}
            />
          </FormField>

          <FormField id="requirementStatus" label={t("fields.requirementStatus")}>
            <Select
              id="requirementStatus"
              value={values.requirementStatus}
              onChange={(value) =>
                setValue("requirementStatus", value as TRequirementStatus)
              }
              options={progressOptions}
              disabled={isPending}
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
            id="notes"
            label={t("fields.notes")}
            error={errors.notes}
            className="sm:col-span-2"
          >
            <Textarea
              id="notes"
              value={values.notes}
              onChange={(event) => setValue("notes", event.target.value)}
              hasError={Boolean(errors.notes)}
              disabled={isPending}
              placeholder={t("notesPlaceholder")}
            />
          </FormField>
        </FormGrid>
      </form>
    </Modal>
  );
};

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
import { PROPERTY_PURPOSES } from "@/config/property";
import { useContactOptions } from "@/features/contacts/hooks/use-contact-options";
import { useFacilityOptions } from "@/features/facilities/hooks/use-facility-options";
import { useAreaOptions } from "@/features/locations/hooks/use-area-options";
import { useCityOptions } from "@/features/locations/hooks/use-city-options";
import { useSaveProperty } from "@/features/properties/hooks/use-save-property";
import { propertySchema } from "@/features/properties/schemas/property-schema";
import { usePropertyTypeOptions } from "@/features/property-types/hooks/use-property-type-options";
import { useFormState } from "@/hooks/use-form-state";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import { toNumberInput, toOptionalNumber } from "@/utils/number";
import { toSelectOptions, withMissingOptions } from "@/utils/options";
import { getAllowedListingStatuses } from "@/utils/property";
import { emptyToNull } from "@/utils/string";
import { toTranslatedFieldErrors } from "@/utils/zod";
import type { IProperty, IPropertyFormValues, TPropertyPurpose } from "@/types/property";
import type { IPropertyFormDialogProps } from "@/features/properties/types/property-components";

const toFormValues = (property: IProperty | null): IPropertyFormValues => ({
  propertyTypeId: property?.propertyTypeId ?? "",
  ownerContactId: property?.ownerContactId ?? "",
  title: property?.title ?? "",
  description: property?.description ?? "",
  purpose: property?.purpose ?? "rent",
  price: toNumberInput(property?.price),
  securityDeposit: toNumberInput(property?.securityDeposit),
  areaSqft: toNumberInput(property?.areaSqft),
  facilityIds: property?.facilities.map((facility) => facility.id) ?? [],
  floor: property?.floor ?? "",
  cityId: property?.cityId ?? "",
  areaId: property?.areaId ?? "",
  address: property?.address ?? "",
  propertyStatus: property?.propertyStatus ?? "available",
  status: property?.status ?? true,
});

const toPayload = (values: IPropertyFormValues) => ({
  propertyTypeId: values.propertyTypeId,
  ownerContactId: emptyToNull(values.ownerContactId),
  title: values.title.trim(),
  description: emptyToNull(values.description),
  purpose: values.purpose,
  price: toOptionalNumber(values.price),
  // A deposit only applies to rentals, so it is dropped for a sale
  securityDeposit:
    values.purpose === "rent" ? toOptionalNumber(values.securityDeposit) : null,
  areaSqft: toOptionalNumber(values.areaSqft),
  facilityIds: values.facilityIds,
  floor: emptyToNull(values.floor),
  cityId: values.cityId,
  areaId: emptyToNull(values.areaId),
  address: emptyToNull(values.address),
  propertyStatus: values.propertyStatus,
  status: values.status,
});

export const PropertyFormDialog = ({ isOpen, property, onClose }: IPropertyFormDialogProps) => {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const { options: typeOptions } = usePropertyTypeOptions(isOpen);
  const { options: contactOptions } = useContactOptions(isOpen);
  const { options: facilityOptions } = useFacilityOptions(isOpen);
  const { options: cityOptions } = useCityOptions(isOpen);
  const { values, errors, setValue, setErrors, reset } = useFormState(
    toFormValues(property),
  );
  const { options: areaOptions, isPending: isLoadingAreas } = useAreaOptions(
    values.cityId,
    isOpen,
  );
  const { mutate, isPending, error, reset: resetMutation } = useSaveProperty();

  useEffect(() => {
    if (!isOpen) return;

    reset(toFormValues(property));
    resetMutation();
  }, [isOpen, property, reset, resetMutation]);

  // A facility deactivated after it was picked still shows, so it is not silently dropped
  const facilitySelectOptions = withMissingOptions(
    facilityOptions,
    toSelectOptions(property?.facilities ?? []),
  );

  const statusOptions = [
    { value: "true", label: tCommon("active") },
    { value: "false", label: tCommon("deactivated") },
  ];

  const purposeOptions = PROPERTY_PURPOSES.map((purpose) => ({
    value: purpose,
    label: t(`purposes.${purpose}`),
  }));

  const listingStatusOptions = getAllowedListingStatuses(values.purpose).map((status) => ({
    value: status,
    label: t(`propertyStatuses.${status}`),
  }));

  const ownerOptions = [{ value: "", label: t("noOwner") }, ...contactOptions];

  // The saved city and area stay listed even if they were deactivated since
  const citySelectOptions = withMissingOptions(
    cityOptions,
    property ? [{ value: property.cityId, label: property.city }] : [],
  );
  const savedArea =
    property?.areaId && property.cityId === values.cityId
      ? [{ value: property.areaId, label: property.areaName ?? "" }]
      : [];
  const areaSelectOptions = [
    { value: "", label: t("noArea") },
    ...withMissingOptions(areaOptions, savedArea),
  ];

  // An area belongs to one city, so changing the city clears it
  const handleCityChange = (cityId: string) => {
    setValue("cityId", cityId);
    setValue("areaId", "");
  };

  const handlePurposeChange = (purpose: TPropertyPurpose) => {
    setValue("purpose", purpose);

    // A sold listing cannot become a rental, so its closing status resets
    if (!getAllowedListingStatuses(purpose).includes(values.propertyStatus)) {
      setValue("propertyStatus", "available");
    }
  };

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
            property
              ? t("updated", { name: saved.title })
              : t("created", { name: saved.title }),
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
          <FormField
            id="title"
            label={t("fields.title")}
            error={errors.title}
            className="sm:col-span-2"
          >
            <Input
              id="title"
              value={values.title}
              onChange={(event) => setValue("title", event.target.value)}
              hasError={Boolean(errors.title)}
              disabled={isPending}
              placeholder={t("titlePlaceholder")}
              autoFocus
            />
          </FormField>

          <FormField id="purpose" label={t("fields.purpose")}>
            <Select
              id="purpose"
              value={values.purpose}
              onChange={(value) => handlePurposeChange(value as TPropertyPurpose)}
              options={purposeOptions}
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="propertyTypeId"
            label={t("fields.propertyType")}
            error={errors.propertyTypeId}
          >
            <Select
              id="propertyTypeId"
              value={values.propertyTypeId}
              onChange={(value) => setValue("propertyTypeId", value)}
              options={typeOptions}
              placeholder={t("selectType")}
              hasError={Boolean(errors.propertyTypeId)}
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="price"
            label={values.purpose === "rent" ? t("fields.monthlyRent") : t("fields.salePrice")}
            error={errors.price}
          >
            <Input
              id="price"
              value={values.price}
              onChange={(event) => setValue("price", event.target.value)}
              hasError={Boolean(errors.price)}
              disabled={isPending}
              inputMode="numeric"
            />
          </FormField>

          {values.purpose === "rent" ? (
            <FormField
              id="securityDeposit"
              label={t("fields.securityDeposit")}
              error={errors.securityDeposit}
            >
              <Input
                id="securityDeposit"
                value={values.securityDeposit}
                onChange={(event) => setValue("securityDeposit", event.target.value)}
                hasError={Boolean(errors.securityDeposit)}
                disabled={isPending}
                inputMode="numeric"
              />
            </FormField>
          ) : null}

          <FormField id="areaSqft" label={t("fields.areaSqft")} error={errors.areaSqft}>
            <Input
              id="areaSqft"
              value={values.areaSqft}
              onChange={(event) => setValue("areaSqft", event.target.value)}
              hasError={Boolean(errors.areaSqft)}
              disabled={isPending}
              inputMode="numeric"
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

          <FormField id="floor" label={t("fields.floor")} error={errors.floor}>
            <Input
              id="floor"
              value={values.floor}
              onChange={(event) => setValue("floor", event.target.value)}
              hasError={Boolean(errors.floor)}
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="cityId"
            label={t("fields.city")}
            error={errors.cityId}
            hint={t("locationHint")}
          >
            <Select
              id="cityId"
              value={values.cityId}
              onChange={handleCityChange}
              options={citySelectOptions}
              placeholder={t("selectCity")}
              hasError={Boolean(errors.cityId)}
              disabled={isPending}
            />
          </FormField>

          <FormField id="areaId" label={t("fields.areaName")} error={errors.areaId}>
            <Select
              id="areaId"
              value={values.areaId}
              onChange={(value) => setValue("areaId", value)}
              options={areaSelectOptions}
              placeholder={values.cityId ? t("noArea") : t("selectCityFirst")}
              hasError={Boolean(errors.areaId)}
              disabled={isPending || !values.cityId || isLoadingAreas}
            />
          </FormField>

          <FormField id="address" label={t("fields.address")} error={errors.address}>
            <Input
              id="address"
              value={values.address}
              onChange={(event) => setValue("address", event.target.value)}
              hasError={Boolean(errors.address)}
              disabled={isPending}
            />
          </FormField>

          <FormField id="ownerContactId" label={t("fields.owner")} hint={t("ownerHint")}>
            <Select
              id="ownerContactId"
              value={values.ownerContactId}
              onChange={(value) => setValue("ownerContactId", value)}
              options={ownerOptions}
              disabled={isPending}
            />
          </FormField>

          <FormField id="propertyStatus" label={t("fields.propertyStatus")}>
            <Select
              id="propertyStatus"
              value={values.propertyStatus}
              onChange={(value) =>
                setValue("propertyStatus", value as IPropertyFormValues["propertyStatus"])
              }
              options={listingStatusOptions}
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
            id="description"
            label={t("fields.description")}
            error={errors.description}
            className="sm:col-span-2"
          >
            <Textarea
              id="description"
              value={values.description}
              onChange={(event) => setValue("description", event.target.value)}
              hasError={Boolean(errors.description)}
              disabled={isPending}
            />
          </FormField>
        </FormGrid>
      </form>
    </Modal>
  );
};

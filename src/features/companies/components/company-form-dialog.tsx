"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormGrid } from "@/components/ui/form-grid";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { PHONE_MAX_LENGTH, PHONE_PLACEHOLDER } from "@/config/phone";
import { companySchema } from "@/features/companies/schemas/company-schema";
import { useSaveCompany } from "@/features/companies/hooks/use-save-company";
import { useFormState } from "@/hooks/use-form-state";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import { emptyToUndefined } from "@/utils/string";
import { toTranslatedFieldErrors } from "@/utils/zod";
import type { ICompany, ICompanyFormValues } from "@/types/company";
import type { ICompanyFormDialogProps } from "@/features/companies/types/company-components";

const toFormValues = (company: ICompany | null): ICompanyFormValues => ({
  name: company?.name ?? "",
  email: company?.email ?? "",
  phone: company?.phone ?? "",
  address: company?.address ?? "",
  city: company?.city ?? "",
  status: company?.status ?? true,
  invoiceMailSend: company?.invoiceMailSend ?? false,
  voiceAssistantEnabled: company?.voiceAssistantEnabled ?? false,
  // Never returned by the API, so the field always starts blank
  mailPassword: "",
});

const toPayload = (values: ICompanyFormValues) => ({
  name: values.name.trim(),
  email: emptyToUndefined(values.email),
  phone: emptyToUndefined(values.phone),
  address: emptyToUndefined(values.address),
  city: emptyToUndefined(values.city),
  status: values.status,
  invoiceMailSend: values.invoiceMailSend,
  voiceAssistantEnabled: values.voiceAssistantEnabled,
  // Blank means "keep the current one" — dropped before sending
  mailPassword: emptyToUndefined(values.mailPassword),
});

export const CompanyFormDialog = ({
  isOpen,
  company,
  onClose,
}: ICompanyFormDialogProps) => {
  const t = useTranslations("companies");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const { values, errors, setValue, setErrors, reset } = useFormState(
    toFormValues(company),
  );
  const [isMailPasswordVisible, setIsMailPasswordVisible] = useState(false);
  const { mutate, isPending, error, reset: resetMutation } = useSaveCompany();

  useEffect(() => {
    if (!isOpen) return;

    reset(toFormValues(company));
    resetMutation();
  }, [isOpen, company, reset, resetMutation]);

  const statusOptions = [
    { value: "true", label: tCommon("active") },
    { value: "false", label: tCommon("deactivated") },
  ];

  const yesNoOptions = [
    { value: "true", label: tCommon("yes") },
    { value: "false", label: tCommon("no") },
  ];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = companySchema.safeParse(toPayload(values));

    if (!parsed.success) {
      setErrors(
        toTranslatedFieldErrors<ICompanyFormValues>(parsed.error, (key) =>
          t(`errors.${key}`),
        ),
      );
      return;
    }

    mutate(
      { id: company?.id, payload: parsed.data },
      {
        onSuccess: (saved) => {
          showToast(
            company ? t("updated", { name: saved.name }) : t("created", { name: saved.name }),
          );
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title={company ? t("editTitle") : t("createTitle")}
      description={company ? t("editSubtitle") : t("createSubtitle")}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" form="company-form" isLoading={isPending}>
            {tCommon("save")}
          </Button>
        </>
      }
    >
      <form id="company-form" onSubmit={handleSubmit} noValidate className="space-y-4">
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

          <FormField id="email" label={t("fields.email")} error={errors.email}>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(event) => setValue("email", event.target.value)}
              hasError={Boolean(errors.email)}
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="mailPassword"
            label={t("fields.mailPassword")}
            error={errors.mailPassword}
          >
            <Input
              id="mailPassword"
              type={isMailPasswordVisible ? "text" : "password"}
              value={values.mailPassword}
              onChange={(event) => setValue("mailPassword", event.target.value)}
              hasError={Boolean(errors.mailPassword)}
              disabled={isPending}
              autoComplete="new-password"
              placeholder={company?.hasMailPassword ? "••••••••" : undefined}
              trailing={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMailPasswordVisible((current) => !current)}
                  aria-label={
                    isMailPasswordVisible
                      ? t("fields.hidePassword")
                      : t("fields.showPassword")
                  }
                  tabIndex={-1}
                >
                  {isMailPasswordVisible ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </Button>
              }
            />
          </FormField>

          <FormField id="phone" label={t("fields.phone")} error={errors.phone}>
            <Input
              id="phone"
              value={values.phone}
              onChange={(event) => setValue("phone", event.target.value)}
              hasError={Boolean(errors.phone)}
              disabled={isPending}
              placeholder={PHONE_PLACEHOLDER}
              inputMode="numeric"
              maxLength={PHONE_MAX_LENGTH}
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

          <FormField id="status" label={t("fields.status")}>
            <Select
              id="status"
              value={String(values.status)}
              onChange={(value) => setValue("status", value === "true")}
              options={statusOptions}
              disabled={isPending}
            />
          </FormField>

          <FormField id="invoiceMailSend" label={t("fields.invoiceMailSend")}>
            <Select
              id="invoiceMailSend"
              value={String(values.invoiceMailSend)}
              onChange={(value) => setValue("invoiceMailSend", value === "true")}
              options={yesNoOptions}
              disabled={isPending}
            />
          </FormField>

          <FormField id="voiceAssistantEnabled" label={t("fields.voiceAssistant")}>
            <Select
              id="voiceAssistantEnabled"
              value={String(values.voiceAssistantEnabled)}
              onChange={(value) => setValue("voiceAssistantEnabled", value === "true")}
              options={yesNoOptions}
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="address"
            label={t("fields.address")}
            error={errors.address}
            className="sm:col-span-2"
          >
            <Input
              id="address"
              value={values.address}
              onChange={(event) => setValue("address", event.target.value)}
              hasError={Boolean(errors.address)}
              disabled={isPending}
            />
          </FormField>
        </FormGrid>
      </form>
    </Modal>
  );
};

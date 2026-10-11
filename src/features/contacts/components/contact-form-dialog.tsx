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
import { Textarea } from "@/components/ui/textarea";
import { PHONE_MAX_LENGTH, PHONE_PLACEHOLDER } from "@/config/phone";
import { contactSchema } from "@/features/contacts/schemas/contact-schema";
import { useSaveContact } from "@/features/contacts/hooks/use-save-contact";
import { useFormState } from "@/hooks/use-form-state";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import { emptyToNull } from "@/utils/string";
import { toTranslatedFieldErrors } from "@/utils/zod";
import type { IContact, IContactFormValues } from "@/types/contact";
import type { IContactFormDialogProps } from "@/features/contacts/types/contact-components";

const toFormValues = (contact: IContact | null): IContactFormValues => ({
  name: contact?.name ?? "",
  phone: contact?.phone ?? "",
  email: contact?.email ?? "",
  cnic: contact?.cnic ?? "",
  address: contact?.address ?? "",
  notes: contact?.notes ?? "",
  status: contact?.status ?? true,
});

const toPayload = (values: IContactFormValues) => ({
  name: values.name.trim(),
  phone: values.phone.trim(),
  email: emptyToNull(values.email),
  cnic: emptyToNull(values.cnic),
  address: emptyToNull(values.address),
  notes: emptyToNull(values.notes),
  status: values.status,
});

export const ContactFormDialog = ({ isOpen, contact, onClose }: IContactFormDialogProps) => {
  const t = useTranslations("contacts");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const { values, errors, setValue, setErrors, reset } = useFormState(
    toFormValues(contact),
  );
  const { mutate, isPending, error, reset: resetMutation } = useSaveContact();

  useEffect(() => {
    if (!isOpen) return;

    reset(toFormValues(contact));
    resetMutation();
  }, [isOpen, contact, reset, resetMutation]);

  const statusOptions = [
    { value: "true", label: tCommon("active") },
    { value: "false", label: tCommon("deactivated") },
  ];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = contactSchema.safeParse(toPayload(values));

    if (!parsed.success) {
      setErrors(
        toTranslatedFieldErrors<IContactFormValues>(parsed.error, (key) =>
          t(`errors.${key}`),
        ),
      );
      return;
    }

    mutate(
      { id: contact?.id, payload: parsed.data },
      {
        onSuccess: (saved) => {
          showToast(
            contact ? t("updated", { name: saved.name }) : t("created", { name: saved.name }),
          );
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title={contact ? t("editTitle") : t("createTitle")}
      description={contact ? t("editSubtitle") : t("createSubtitle")}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" form="contact-form" isLoading={isPending}>
            {tCommon("save")}
          </Button>
        </>
      }
    >
      <form id="contact-form" onSubmit={handleSubmit} noValidate className="space-y-4">
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

          <FormField id="cnic" label={t("fields.cnic")} error={errors.cnic}>
            <Input
              id="cnic"
              value={values.cnic}
              onChange={(event) => setValue("cnic", event.target.value)}
              hasError={Boolean(errors.cnic)}
              disabled={isPending}
              placeholder={t("cnicPlaceholder")}
              maxLength={15}
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

          <FormField id="address" label={t("fields.address")} error={errors.address}>
            <Input
              id="address"
              value={values.address}
              onChange={(event) => setValue("address", event.target.value)}
              hasError={Boolean(errors.address)}
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
            />
          </FormField>
        </FormGrid>
      </form>
    </Modal>
  );
};

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, ChevronRight, Circle, Pencil } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { AssistantFieldControl } from "@/features/voice-assistant/components/assistant-field-control";
import {
  getFilledSummary,
  getFormDef,
  getVisibleFields,
} from "@/features/voice-assistant/engine/form-engine";
import { isEmptyValue } from "@/features/voice-assistant/forms/form-values";
import { useVoiceAssistant } from "@/features/voice-assistant/hooks/use-voice-assistant";
import { cn } from "@/utils/cn";
import type { IAssistantFormCardProps } from "@/types/voice-assistant";

export const AssistantFormCard = ({ className, isCompact = false }: IAssistantFormCardProps) => {
  const t = useTranslations();
  const {
    forms,
    engineContext,
    focusField,
    reviewActiveForm,
    submitActiveForm,
    cancelActiveForm,
  } = useVoiceAssistant();
  const [submitError, setSubmitError] = useState<{ formId: string; message: string } | null>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const form = forms.at(-1);
  const parent = forms.at(-2);

  // Keeps the field Gemini is asking about in view as the conversation moves on
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [form?.activeField, form?.stage]);

  if (!form) return null;

  const def = getFormDef(form.type);
  const fields = getVisibleFields(def, form);
  const required = fields.filter((field) => field.required);
  const filledRequired = required.filter((field) => !isEmptyValue(form.values[field.key])).length;
  const summary = getFilledSummary(form, engineContext);
  const isReviewing = form.stage === "review" || form.stage === "saving";
  const visibleFields = isCompact ? fields.filter((field) => field.key === form.activeField) : fields;
  const errorMessage = submitError?.formId === form.id ? submitError.message : null;

  const handleSubmit = async () => {
    setSubmitError(null);
    const result = await submitActiveForm();
    if (!result.ok) setSubmitError({ formId: form.id, message: String(result.error ?? t("common.error")) });
  };

  return (
    <Card className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          {parent && form.parentField ? (
            <p className="text-xs text-muted-foreground">
              {t("assistant.form.nestedFor", { form: t(getFormDef(parent.type).titleKey) })}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold">{t(def.titleKey)}</h2>
        </div>
        <Badge variant={filledRequired === required.length ? "success" : "info"}>
          {t("assistant.form.progress", { filled: filledRequired, total: required.length })}
        </Badge>
      </div>

      {isReviewing ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("assistant.form.reviewSubtitle")}</p>
          <dl className="divide-y divide-border rounded-lg border border-border">
            {summary.map((item) => (
              <div key={item.field} className="flex items-start justify-between gap-3 px-3 py-2 text-sm">
                <dt className="text-muted-foreground">{item.label}</dt>
                <dd className="text-end font-medium break-words">{item.value}</dd>
              </div>
            ))}
          </dl>
          {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : null}
        </div>
      ) : (
        <div className={cn("grid gap-3", !isCompact && "sm:grid-cols-2")}>
          {visibleFields.map((field) => {
            const isActive = field.key === form.activeField;
            const isFilled = !isEmptyValue(form.values[field.key]);
            const isWide = field.kind === "textarea" || field.kind === "multiselect";

            return (
              <div
                key={field.key}
                ref={isActive ? activeRef : undefined}
                className={cn(
                  "rounded-lg border p-3 transition-[border-color,box-shadow,background-color]",
                  isActive ? "border-primary bg-primary-soft/40 ring-2 ring-primary/20" : "border-transparent",
                  isWide && !isCompact && "sm:col-span-2",
                )}
              >
                <FormField
                  id={`${form.id}-${field.key}`}
                  label={`${t(field.labelKey)}${field.required ? " *" : ""}`}
                  error={form.errors[field.key]}
                  hint={isActive ? t("assistant.form.askingNow") : undefined}
                >
                  <AssistantFieldControl form={form} field={field} />
                </FormField>
                {!isActive ? (
                  <button
                    type="button"
                    onClick={() => focusField(field.key)}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {isFilled ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden />
                    ) : (
                      <Circle className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {isFilled ? t("assistant.form.filled") : t("assistant.form.askAbout")}
                  </button>
                ) : null}
              </div>
            );
          })}
          {isCompact && visibleFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("assistant.form.allRequiredDone")}</p>
          ) : null}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
        <Button variant="ghost" size="sm" onClick={cancelActiveForm} disabled={form.stage === "saving"}>
          {t("common.cancel")}
        </Button>
        {isReviewing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => focusField(fields[0]?.key ?? "")}
              disabled={form.stage === "saving"}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              {t("assistant.form.keepEditing")}
            </Button>
            <Button size="sm" onClick={() => void handleSubmit()} isLoading={form.stage === "saving"}>
              {t("common.save")}
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={() => void reviewActiveForm()} disabled={filledRequired < required.length}>
            {t("assistant.form.review")}
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
          </Button>
        )}
      </div>
    </Card>
  );
};

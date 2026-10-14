"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ASSISTANT_OPTIONS_QUERY_KEY } from "@/config/assistant";
import {
  applyFieldInputs,
  buildFormReport,
  createFormState,
  getFormDef,
  loadFieldOptions,
  reviewForm,
  setFieldValue,
} from "@/features/voice-assistant/engine/form-engine";
import { getApiErrorMessage } from "@/utils/api";
import type {
  IAssistantFieldInput,
  IAssistantFormState,
  IAssistantSavedRecord,
  IAssistantToolResult,
  IFormEngineContext,
  TAssistantFormType,
  TAssistantValue,
} from "@/types/voice-assistant";

const NO_FORM: IAssistantToolResult = {
  ok: false,
  error: "No form is open. Call startForm first.",
};

// Owns the stack of open forms; the last one is active, earlier ones wait for a nested record
export const useAssistantForms = () => {
  const queryClient = useQueryClient();
  const t = useTranslations();
  const [forms, setForms] = useState<IAssistantFormState[]>([]);
  const formsRef = useRef<IAssistantFormState[]>([]);

  const context = useMemo<IFormEngineContext>(
    () => ({ queryClient, translate: (key) => t(key) }),
    [queryClient, t],
  );

  const commit = useCallback((next: IAssistantFormState[]) => {
    formsRef.current = next;
    setForms(next);
  }, []);

  const getActive = (): IAssistantFormState | undefined => formsRef.current.at(-1);

  const replaceActive = useCallback(
    (next: IAssistantFormState) => commit([...formsRef.current.slice(0, -1), next]),
    [commit],
  );

  const startForm = useCallback(
    async (type: TAssistantFormType): Promise<IAssistantToolResult> => {
      const state = createFormState(type);
      commit([state]);
      return { ok: true, report: await buildFormReport(state, context) };
    },
    [commit, context],
  );

  const fillFields = useCallback(
    async (inputs: readonly IAssistantFieldInput[]): Promise<IAssistantToolResult> => {
      const active = formsRef.current.at(-1);

      if (!active) return NO_FORM;

      const result = await applyFieldInputs(active, inputs, context);
      replaceActive(result.state);

      return {
        ok: result.problems.length === 0,
        report: await buildFormReport(result.state, context, {
          filled: result.filled,
          problems: result.problems,
        }),
      };
    },
    [context, replaceActive],
  );

  const getFieldOptions = useCallback(
    async (fieldKey: string, search?: string): Promise<IAssistantToolResult> => {
      const active = formsRef.current.at(-1);

      if (!active) return NO_FORM;

      const field = getFormDef(active.type).fields.find((candidate) => candidate.key === fieldKey);

      if (!field?.source) return { ok: false, error: `"${fieldKey}" is not a dropdown field.` };

      const options = await loadFieldOptions(field, active, context, search);
      return { ok: true, total: options.length, options: options.slice(0, 20).map((option) => option.label) };
    },
    [context],
  );

  const focusField = useCallback(
    (fieldKey: string): IAssistantToolResult => {
      const active = formsRef.current.at(-1);

      if (!active) return NO_FORM;
      if (!getFormDef(active.type).fields.some((field) => field.key === fieldKey)) {
        return { ok: false, error: `This form has no field "${fieldKey}".` };
      }

      replaceActive({ ...active, activeField: fieldKey, stage: "collecting" });
      return { ok: true };
    },
    [replaceActive],
  );

  const startNestedForm = useCallback(
    async (fieldKey: string): Promise<IAssistantToolResult> => {
      const active = formsRef.current.at(-1);

      if (!active) return NO_FORM;

      const field = getFormDef(active.type).fields.find((candidate) => candidate.key === fieldKey);

      if (!field?.createWith) {
        return { ok: false, error: `"${fieldKey}" cannot create a new record by voice.` };
      }

      const nested = createFormState(field.createWith, fieldKey);
      commit([...formsRef.current, nested]);

      return {
        ok: true,
        note: `A new ${field.createWith} form is open. When it is saved, the ${active.type} form continues.`,
        report: await buildFormReport(nested, context),
      };
    },
    [commit, context],
  );

  const review = useCallback(async (): Promise<IAssistantToolResult> => {
    const active = formsRef.current.at(-1);

    if (!active) return NO_FORM;

    const next = reviewForm(active, context);
    replaceActive(next);

    return { ok: next.stage === "review", report: await buildFormReport(next, context) };
  }, [context, replaceActive]);

  const submit = useCallback(async (): Promise<IAssistantToolResult> => {
    const active = formsRef.current.at(-1);

    if (!active) return NO_FORM;
    if (active.stage !== "review") {
      return { ok: false, error: "Call reviewForm and get the user's confirmation before saving." };
    }

    const def = getFormDef(active.type);
    replaceActive({ ...active, stage: "saving" });

    let saved: IAssistantSavedRecord;

    try {
      saved = await def.submit(def.toPayload(active.values));
    } catch (error) {
      replaceActive({ ...active, stage: "review" });
      return { ok: false, error: getApiErrorMessage(error, t("common.error")) };
    }

    [...def.invalidates, ASSISTANT_OPTIONS_QUERY_KEY].forEach(
      (queryKey) => void queryClient.invalidateQueries({ queryKey }),
    );

    const remaining = formsRef.current.slice(0, -1);
    const parent = remaining.at(-1);

    if (parent && active.parentField) {
      const updatedParent = setFieldValue(parent, active.parentField, saved.id, context, saved.label);
      commit([...remaining.slice(0, -1), updatedParent]);

      return {
        ok: true,
        saved: saved.label,
        note: `Saved and selected in the ${parent.type} form. Continue with it.`,
        report: await buildFormReport(updatedParent, context),
      };
    }

    commit(remaining);
    return { ok: true, saved: saved.label, form: active.type };
  }, [commit, context, queryClient, replaceActive, t]);

  const cancel = useCallback((): IAssistantToolResult => {
    const active = formsRef.current.at(-1);

    if (!active) return NO_FORM;

    commit(formsRef.current.slice(0, -1));
    return { ok: true, returnedTo: formsRef.current.at(-1)?.type ?? null };
  }, [commit]);

  const setValueFromScreen = useCallback(
    (fieldKey: string, value: TAssistantValue, label?: string) => {
      const active = formsRef.current.at(-1);

      if (!active) return;

      replaceActive(setFieldValue(active, fieldKey, value, context, label));
    },
    [context, replaceActive],
  );

  return {
    forms,
    context,
    getActive,
    startForm,
    fillFields,
    getFieldOptions,
    focusField,
    startNestedForm,
    review,
    submit,
    cancel,
    setValueFromScreen,
  };
};

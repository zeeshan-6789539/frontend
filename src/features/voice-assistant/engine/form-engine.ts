import { ASSISTANT_MAX_OPTIONS_READ_ALOUD } from "@/config/assistant";
import { assistantForms } from "@/features/voice-assistant/forms";
import { isEmptyValue } from "@/features/voice-assistant/forms/form-values";
import { optionSources } from "@/features/voice-assistant/forms/option-sources";
import { matchOption, normalizeText } from "@/utils/fuzzy-match";
import { parseSpokenDate } from "@/utils/spoken-date";
import { normalizeSpokenPhone, parseSpokenAmount } from "@/utils/spoken-number";
import type { ISelectOption } from "@/types/ui";
import type {
  IAssistantApplyResult,
  IAssistantFieldDef,
  IAssistantFieldInput,
  IAssistantFieldProblem,
  IAssistantFieldSummary,
  IAssistantFilledField,
  IAssistantFormDef,
  IAssistantFormReport,
  IAssistantFormState,
  IFormEngineContext,
  TAssistantFormType,
  TAssistantValue,
} from "@/types/voice-assistant";

const CLEAR_WORDS = new Set(["", "none", "skip", "clear", "nothing", "remove", "koi nahi", "kuch nahi"]);

export const getFormDef = (type: TAssistantFormType): IAssistantFormDef => assistantForms[type];

export const getVisibleFields = (
  def: IAssistantFormDef,
  state: IAssistantFormState,
): IAssistantFieldDef[] => def.fields.filter((field) => field.isVisible?.(state.values) ?? true);

const getFieldLabel = (field: IAssistantFieldDef, context: IFormEngineContext): string =>
  context.translate(field.labelKey);

export const loadFieldOptions = async (
  field: IAssistantFieldDef,
  context: IFormEngineContext,
  search?: string,
): Promise<ISelectOption[]> => {
  if (!field.source) return [];

  return optionSources[field.source].load({
    queryClient: context.queryClient,
    translate: context.translate,
    search,
  });
};

const getFirstOpenField = (
  def: IAssistantFormDef,
  state: IAssistantFormState,
): IAssistantFieldDef | undefined => {
  const visible = getVisibleFields(def, state);

  return (
    visible.find((field) => field.required && isEmptyValue(state.values[field.key])) ??
    visible.find((field) => state.errors[field.key] !== undefined)
  );
};

export const createFormState = (
  type: TAssistantFormType,
  parentField: string | null = null,
): IAssistantFormState => {
  const def = getFormDef(type);
  const state: IAssistantFormState = {
    id: `${type}-${crypto.randomUUID()}`,
    type,
    values: { ...def.defaults },
    labels: {},
    errors: {},
    activeField: null,
    stage: "collecting",
    parentField,
  };

  return { ...state, activeField: getFirstOpenField(def, state)?.key ?? null };
};

// Re-runs the existing Zod schema; only fields with a value are flagged unless the whole form is checked
export const validateForm = (
  def: IAssistantFormDef,
  state: IAssistantFormState,
  context: IFormEngineContext,
  isFullCheck: boolean,
): Record<string, string> => {
  const parsed = def.schema.safeParse(def.toPayload(state.values));
  const errors: Record<string, string> = {};

  if (parsed.success) return errors;

  parsed.error.issues.forEach((issue) => {
    const [key] = issue.path;

    if (typeof key !== "string" || errors[key] !== undefined) return;

    const field = def.fields.find((candidate) => candidate.key === key);
    const isVisible = field ? (field.isVisible?.(state.values) ?? true) : false;

    if (!field || !isVisible) return;
    if (!isFullCheck && isEmptyValue(state.values[key])) return;

    errors[key] = context.translate(`${def.errorsKey}.${issue.message}`);
  });

  return errors;
};

const withValue = (
  state: IAssistantFormState,
  key: string,
  value: TAssistantValue,
  label?: string,
): IAssistantFormState => {
  const labels = { ...state.labels };

  if (label === undefined) delete labels[key];
  else labels[key] = label;

  return { ...state, values: { ...state.values, [key]: value }, labels };
};

export const setFieldValue = (
  state: IAssistantFormState,
  key: string,
  value: TAssistantValue,
  context: IFormEngineContext,
  label?: string,
): IAssistantFormState => {
  const def = getFormDef(state.type);
  const next = withValue(state, key, value, label);
  const errors = validateForm(def, next, context, false);
  const withErrors = { ...next, errors, stage: "collecting" as const };

  return { ...withErrors, activeField: getFirstOpenField(def, withErrors)?.key ?? null };
};

const isClearWord = (value: string): boolean => CLEAR_WORDS.has(normalizeText(value));

export const resolveScalar = (
  field: IAssistantFieldDef,
  raw: string,
): { value: string } | { problem: string } => {
  const trimmed = raw.trim();

  if (field.kind === "amount" || field.kind === "number") {
    // "5th" is spoken for a day of the month
    const amount = parseSpokenAmount(trimmed.replace(/(\d)(st|nd|rd|th)\b/gi, "$1"));
    return amount === null
      ? { problem: `"${trimmed}" is not a number. Ask again and pass digits only.` }
      : { value: String(amount) };
  }

  if (field.kind === "date") {
    const date = parseSpokenDate(trimmed);
    return date === null
      ? { problem: `"${trimmed}" is not a date. Ask again and pass it as YYYY-MM-DD.` }
      : { value: date };
  }

  if (field.kind === "phone") return { value: normalizeSpokenPhone(trimmed) };
  if (field.kind === "email" || field.kind === "url") return { value: trimmed.replace(/\s+/g, "") };

  return { value: trimmed };
};

const resolveSelect = async (
  field: IAssistantFieldDef,
  raw: string,
  context: IFormEngineContext,
): Promise<{ option: ISelectOption } | { problem: IAssistantFieldProblem }> => {
  const isServerSearch = field.source ? optionSources[field.source].searchesServer : false;
  let options = await loadFieldOptions(field, context, isServerSearch ? raw : undefined);

  // A server search for a full name can miss; fall back to the newest records
  if (isServerSearch && options.length === 0) options = await loadFieldOptions(field, context);

  const match = matchOption(options, raw);

  if (match.status === "matched" && match.option) return { option: match.option };

  return {
    problem: {
      field: field.key,
      label: getFieldLabel(field, context),
      issue: match.status === "ambiguous" ? "ambiguous" : "notFound",
      message:
        match.status === "ambiguous"
          ? `"${raw}" matches several options. Ask which one.`
          : `No option matches "${raw}".${field.createWith ? ` Offer to create a new ${field.createWith} with startNestedForm.` : " Read some options to the user."}`,
      candidates: (match.status === "ambiguous" ? match.candidates : options)
        .slice(0, ASSISTANT_MAX_OPTIONS_READ_ALOUD)
        .map((option) => option.label),
    },
  };
};

export const applyFieldInputs = async (
  initial: IAssistantFormState,
  inputs: readonly IAssistantFieldInput[],
  context: IFormEngineContext,
): Promise<IAssistantApplyResult> => {
  const def = getFormDef(initial.type);
  let state = initial;
  const filled: IAssistantFilledField[] = [];
  const problems: IAssistantFieldProblem[] = [];

  for (const input of inputs) {
    const field = def.fields.find((candidate) => candidate.key === input.field);

    if (!field) {
      problems.push({
        field: input.field,
        label: input.field,
        issue: "unknownField",
        message: `This form has no field "${input.field}". Use the field keys from the form report.`,
      });
      continue;
    }

    const label = getFieldLabel(field, context);

    if (isClearWord(input.value)) {
      state = withValue(state, field.key, def.defaults[field.key] ?? "");
      filled.push({ field: field.key, label, value: "(cleared)" });
      continue;
    }

    if (field.kind === "select") {
      const result = await resolveSelect(field, input.value, context);

      if ("problem" in result) {
        problems.push(result.problem);
        continue;
      }

      state = withValue(state, field.key, result.option.value, result.option.label);
      filled.push({ field: field.key, label, value: result.option.label });
      continue;
    }

    const resolved = resolveScalar(field, input.value);

    if ("problem" in resolved) {
      problems.push({ field: field.key, label, issue: "invalid", message: resolved.problem });
      continue;
    }

    state = withValue(state, field.key, resolved.value);
    filled.push({ field: field.key, label, value: resolved.value });
  }

  const errors = validateForm(def, state, context, false);

  Object.entries(errors).forEach(([key, message]) => {
    const field = def.fields.find((candidate) => candidate.key === key);
    problems.push({
      field: key,
      label: field ? getFieldLabel(field, context) : key,
      issue: "invalid",
      message,
    });
  });

  const withErrors: IAssistantFormState = { ...state, errors, stage: "collecting" };
  const problemField = problems.find((problem) => problem.issue !== "unknownField")?.field;

  return {
    state: {
      ...withErrors,
      activeField: problemField ?? getFirstOpenField(def, withErrors)?.key ?? null,
    },
    filled,
    problems,
  };
};

export const summarizeField = async (
  field: IAssistantFieldDef,
  context: IFormEngineContext,
): Promise<IAssistantFieldSummary> => {
  const options = field.source ? await loadFieldOptions(field, context) : [];

  return {
    field: field.key,
    label: getFieldLabel(field, context),
    kind: field.kind,
    required: field.required,
    hint: field.hint,
    options:
      options.length > 0
        ? options.slice(0, ASSISTANT_MAX_OPTIONS_READ_ALOUD).map((option) => option.label)
        : undefined,
    canCreateNew: field.createWith !== undefined,
  };
};

const describeValue = (state: IAssistantFormState, key: string): string =>
  state.labels[key] ?? state.values[key] ?? "";

export const buildFormReport = async (
  state: IAssistantFormState,
  context: IFormEngineContext,
  extra: Pick<IAssistantFormReport, "filled" | "problems"> = { filled: [], problems: [] },
): Promise<IAssistantFormReport> => {
  const def = getFormDef(state.type);
  const visible = getVisibleFields(def, state);
  const missingRequired = visible.filter(
    (field) => field.required && isEmptyValue(state.values[field.key]),
  );
  const optionalRemaining = visible.filter(
    (field) => !field.required && isEmptyValue(state.values[field.key]),
  );
  const activeField = visible.find((field) => field.key === state.activeField);
  const nextField = activeField ?? missingRequired[0];

  let instruction: string;

  if (state.stage === "review") {
    instruction =
      "The summary card is on screen. Read the filled values back briefly and ask the user to confirm. Call submitForm only after a clear yes.";
  } else if (extra.problems.length > 0) {
    instruction = "Resolve the problems first: ask the user about each one, offering the candidates.";
  } else if (nextField) {
    instruction = `Ask the user for "${getFieldLabel(nextField, context)}" only. One question at a time.`;
  } else if (optionalRemaining.length > 0) {
    instruction =
      "All required fields are filled. Ask ONCE whether they want to add any optional details (list a few). If they decline, call reviewForm.";
  } else {
    instruction = "Everything is filled. Call reviewForm to show the summary.";
  }

  return {
    form: state.type,
    stage: state.stage,
    filled:
      extra.filled.length > 0
        ? extra.filled
        : visible
            .filter((field) => !isEmptyValue(state.values[field.key]))
            .map((field) => ({
              field: field.key,
              label: getFieldLabel(field, context),
              value: describeValue(state, field.key),
            })),
    problems: extra.problems,
    nextField: nextField ? await summarizeField(nextField, context) : null,
    missingRequired: missingRequired.map((field) => field.key),
    optionalRemaining: optionalRemaining.map((field) => `${field.key} (${getFieldLabel(field, context)})`),
    instruction,
  };
};

// Moves to the summary card; refuses while required fields are missing or invalid
export const reviewForm = (
  state: IAssistantFormState,
  context: IFormEngineContext,
): IAssistantFormState => {
  const def = getFormDef(state.type);
  const errors = validateForm(def, state, context, true);
  const hasMissing = getVisibleFields(def, state).some(
    (field) => field.required && isEmptyValue(state.values[field.key]),
  );

  if (hasMissing || Object.keys(errors).length > 0) {
    return { ...state, errors, stage: "collecting", activeField: getFirstOpenField(def, { ...state, errors })?.key ?? null };
  }

  return { ...state, errors, stage: "review", activeField: null };
};

export const getFilledSummary = (
  state: IAssistantFormState,
  context: IFormEngineContext,
): IAssistantFilledField[] =>
  getVisibleFields(getFormDef(state.type), state)
    .filter((field) => !isEmptyValue(state.values[field.key]))
    .map((field) => ({
      field: field.key,
      label: getFieldLabel(field, context),
      value: describeValue(state, field.key),
    }));

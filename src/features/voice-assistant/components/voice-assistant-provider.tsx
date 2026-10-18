"use client";

import { useCallback, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ASSISTANT_FORM_ROLES } from "@/config/assistant";
import { navItems } from "@/config/navigation";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { VoiceAssistantContext } from "@/features/voice-assistant/context/voice-assistant-context";
import {
  getFilledSummary,
  getFormDef,
  resolveScalar,
} from "@/features/voice-assistant/engine/form-engine";
import { searchRecords } from "@/features/voice-assistant/engine/search-records";
import { buildSystemPrompt } from "@/features/voice-assistant/engine/system-prompt";
import { getEnumArg, getFieldInputs, getStringArg } from "@/features/voice-assistant/engine/tool-args";
import { buildNavigationTool, buildRecordTools } from "@/features/voice-assistant/engine/tool-declarations";
import { ASSISTANT_FORM_TYPES } from "@/features/voice-assistant/forms";
import { useAssistantForms } from "@/features/voice-assistant/hooks/use-assistant-forms";
import { useAssistantTranscript } from "@/features/voice-assistant/hooks/use-assistant-transcript";
import { useLiveSession } from "@/features/voice-assistant/hooks/use-live-session";
import { useToast } from "@/hooks/use-toast";
import { usePathname, useRouter } from "@/i18n/navigation";
import { canUseVoiceAssistant, isNavItemVisible } from "@/utils/access";
import { getTodayIsoDate } from "@/utils/format";
import type { FunctionCall } from "@google/genai";
import type { IAssistantProviderProps } from "@/features/voice-assistant/types/voice-assistant-components";
import type { TLocale } from "@/types/locale";
import type {
  IAssistantContextValue,
  IAssistantToolResult,
  ILiveSessionSetup,
  TAssistantFormType,
  TAssistantSearchModule,
  TAssistantValue,
} from "@/types/voice-assistant";

const SEARCH_MODULES: readonly TAssistantSearchModule[] = ["properties", "tenants", "leases", "payments"];

export const VoiceAssistantProvider = ({ children }: IAssistantProviderProps) => {
  const t = useTranslations("assistant");
  const locale = useLocale() as TLocale;
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const { data: user } = useCurrentUser();
  const formsApi = useAssistantForms();
  const transcriptApi = useAssistantTranscript();
  const lastNotifiedRef = useRef<Record<string, string>>({});

  const role = user?.role;
  const isAvailable = canUseVoiceAssistant(user);
  const canUseForms = role !== undefined && ASSISTANT_FORM_ROLES.includes(role);

  const pages = useMemo(
    () =>
      navItems
        .filter((item) => isNavItemVisible(item, user))
        .map((item) => ({ key: item.labelKey, href: item.href })),
    [user],
  );

  const getSetup = useCallback((): ILiveSessionSetup => {
    const forms = canUseForms ? ASSISTANT_FORM_TYPES : [];
    const pageKeys = pages.map((page) => page.key);
    const openForm = formsApi.getActive();
    const formNote = openForm
      ? ` A "${openForm.type}" form is already open on screen; call fillFields with no fields to get its report, then continue it.`
      : "";

    return {
      systemInstruction: buildSystemPrompt({
        userName: user?.name ?? "there",
        role: role ?? "client_admin",
        locale,
        today: getTodayIsoDate(),
        pages: pageKeys,
        forms,
      }),
      functionDeclarations: [
        buildNavigationTool(pageKeys),
        ...(canUseForms ? buildRecordTools(forms) : []),
      ],
      greeting: `[screen] The user opened the voice assistant on the "${pathname}" page. Greet ${user?.name ?? "them"} in one short sentence and ask how you can help.${formNote}`,
    };
  }, [canUseForms, formsApi, locale, pages, pathname, role, user?.name]);

  const handleToolCall = useCallback(
    async (call: FunctionCall): Promise<IAssistantToolResult> => {
      const args = call.args;

      switch (call.name) {
        case "navigate": {
          const page = pages.find((candidate) => candidate.key === getStringArg(args, "page"));
          if (!page) return { ok: false, error: "That page is not available to this user." };
          router.push(page.href);
          return { ok: true, opened: page.key };
        }
        case "searchRecords": {
          const searchModule = getEnumArg(args, "module", SEARCH_MODULES);
          if (!searchModule) return { ok: false, error: "Unknown module." };
          const results = await searchRecords(searchModule, getStringArg(args, "query"), locale);
          transcriptApi.addEntry("system", t("searchResultsTitle", { count: results.total }), results);
          return {
            ok: true,
            total: results.total,
            results: results.items.map((item) => `${item.title} — ${item.subtitle}`),
          };
        }
        case "startForm": {
          const form = getEnumArg(args, "form", ASSISTANT_FORM_TYPES);
          return form ? formsApi.startForm(form) : { ok: false, error: "Unknown form." };
        }
        case "fillFields":
          return formsApi.fillFields(getFieldInputs(args));
        case "getFieldOptions":
          return formsApi.getFieldOptions(getStringArg(args, "field"), getStringArg(args, "search") || undefined);
        case "focusField":
          return formsApi.focusField(getStringArg(args, "field"));
        case "startNestedForm":
          return formsApi.startNestedForm(getStringArg(args, "field"));
        case "reviewForm":
          return formsApi.review();
        case "submitForm": {
          const result = await formsApi.submit();
          if (result.ok && typeof result.saved === "string") showToast(t("saved", { name: result.saved }));
          return result;
        }
        case "cancelForm":
          return formsApi.cancel();
        default:
          return { ok: false, error: `Unknown tool "${call.name ?? ""}".` };
      }
    },
    [formsApi, locale, pages, router, showToast, t, transcriptApi],
  );

  const live = useLiveSession({
    getSetup,
    onToolCall: handleToolCall,
    onFragment: transcriptApi.appendFragment,
    onTurnComplete: transcriptApi.finalize,
  });

  // Keeps Gemini in step with what the user does on screen
  const notify = useCallback(
    (text: string) => {
      live.sendText(`[screen] ${text}`);
    },
    [live],
  );

  const commitField = useCallback(
    (fieldKey: string) => {
      const initial = formsApi.getActive();
      const field = initial
        ? getFormDef(initial.type).fields.find((candidate) => candidate.key === fieldKey)
        : undefined;

      if (!initial || !field) return;

      const raw = initial.values[fieldKey];

      // Typed amounts and phones get the same clean-up as spoken ones, e.g. "2 crore" → 20000000
      if (typeof raw === "string" && raw.trim() !== "" && field.kind !== "select") {
        const resolved = resolveScalar(field, raw);
        if ("value" in resolved && resolved.value !== raw) {
          formsApi.setValueFromScreen(fieldKey, resolved.value);
        }
      }

      const active = formsApi.getActive() ?? initial;
      const notifiedKey = `${active.id}:${fieldKey}`;
      const current = JSON.stringify(active.values[fieldKey] ?? "");

      if (lastNotifiedRef.current[notifiedKey] === current) return;

      lastNotifiedRef.current[notifiedKey] = current;
      const summary = getFilledSummary(active, formsApi.context).find((item) => item.field === fieldKey);

      notify(
        summary
          ? `The user set "${summary.label}" (${fieldKey}) to "${summary.value}".`
          : `The user cleared "${fieldKey}".`,
      );
    },
    [formsApi, notify],
  );

  // Typed messages have no transcription, so they are added to the transcript here
  const sendUserText = useCallback(
    (text: string) => {
      const isSent = live.sendText(text);
      if (isSent) transcriptApi.addEntry("user", text.trim());
      return isSent;
    },
    [live, transcriptApi],
  );

  const setFieldValue = useCallback(
    (fieldKey: string, value: TAssistantValue, label?: string) =>
      formsApi.setValueFromScreen(fieldKey, value, label),
    [formsApi],
  );

  const startForm = useCallback(
    async (type: TAssistantFormType) => {
      await formsApi.startForm(type);
      notify(`The user opened the "${type}" form on screen. Ask for its first field.`);
    },
    [formsApi, notify],
  );

  const focusField = useCallback((fieldKey: string) => void formsApi.focusField(fieldKey), [formsApi]);

  const reviewActiveForm = useCallback(async () => {
    const result = await formsApi.review();
    notify(
      result.ok
        ? "The user pressed Review. The summary card is shown; ask them to confirm."
        : "The user pressed Review but some fields are missing or invalid; ask for them.",
    );
  }, [formsApi, notify]);

  const submitActiveForm = useCallback(async () => {
    const result = await formsApi.submit();

    if (result.ok && typeof result.saved === "string") {
      showToast(t("saved", { name: result.saved }));
      notify(`The user pressed Save and "${result.saved}" was saved. Tell them briefly and ask what's next.`);
    }

    return result;
  }, [formsApi, notify, showToast, t]);

  const cancelActiveForm = useCallback(() => {
    formsApi.cancel();
    notify("The user cancelled the open form on screen.");
  }, [formsApi, notify]);

  const value = useMemo<IAssistantContextValue>(
    () => ({
      status: live.status,
      isActive: live.status !== "idle",
      isMuted: live.isMuted,
      level: live.level,
      error: live.error,
      isAvailable,
      canUseForms,
      transcript: transcriptApi.transcript,
      forms: formsApi.forms,
      engineContext: formsApi.context,
      start: live.start,
      stop: live.stop,
      toggleMute: live.toggleMute,
      sendText: sendUserText,
      startForm,
      setFieldValue,
      commitField,
      focusField,
      reviewActiveForm,
      submitActiveForm,
      cancelActiveForm,
    }),
    [
      live,
      isAvailable,
      canUseForms,
      transcriptApi.transcript,
      formsApi.forms,
      formsApi.context,
      sendUserText,
      startForm,
      setFieldValue,
      commitField,
      focusField,
      reviewActiveForm,
      submitActiveForm,
      cancelActiveForm,
    ],
  );

  return <VoiceAssistantContext.Provider value={value}>{children}</VoiceAssistantContext.Provider>;
};

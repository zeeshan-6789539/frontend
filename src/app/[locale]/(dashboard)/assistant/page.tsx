import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RequireRole } from "@/components/layout/require-role";
import { ASSISTANT_ROLES } from "@/config/assistant";
import { AssistantView } from "@/features/voice-assistant/components/assistant-view";
import { canUseVoiceAssistant } from "@/utils/access";

export const generateMetadata = async ({
  params,
}: PageProps<"/[locale]/assistant">): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "assistant" });

  return { title: t("title") };
};

const AssistantPage = async ({ params }: PageProps<"/[locale]/assistant">) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequireRole roles={ASSISTANT_ROLES} isAllowed={canUseVoiceAssistant}>
      <AssistantView />
    </RequireRole>
  );
};

export default AssistantPage;

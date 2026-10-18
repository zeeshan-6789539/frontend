import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AssistantOnly } from "@/components/layout/assistant-only";
import { AssistantView } from "@/features/voice-assistant/components/assistant-view";

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
    <AssistantOnly>
      <AssistantView />
    </AssistantOnly>
  );
};

export default AssistantPage;

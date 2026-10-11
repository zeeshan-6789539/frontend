import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DealerOnly } from "@/components/layout/dealer-only";
import { PropertiesView } from "@/features/properties/components/properties-view";

export const generateMetadata = async ({
  params,
}: PageProps<"/[locale]/properties">): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "properties" });

  return { title: t("title") };
};

const PropertiesPage = async ({ params }: PageProps<"/[locale]/properties">) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <DealerOnly>
      <PropertiesView />
    </DealerOnly>
  );
};

export default PropertiesPage;

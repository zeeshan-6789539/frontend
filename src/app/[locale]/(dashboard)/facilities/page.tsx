import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DealerOnly } from "@/components/layout/dealer-only";
import { FacilitiesView } from "@/features/facilities/components/facilities-view";

export const generateMetadata = async ({
  params,
}: PageProps<"/[locale]/facilities">): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "facilities" });

  return { title: t("title") };
};

const FacilitiesPage = async ({ params }: PageProps<"/[locale]/facilities">) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <DealerOnly>
      <FacilitiesView />
    </DealerOnly>
  );
};

export default FacilitiesPage;

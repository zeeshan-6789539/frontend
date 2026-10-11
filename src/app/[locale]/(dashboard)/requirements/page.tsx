import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DealerOnly } from "@/components/layout/dealer-only";
import { PropertyRequirementsView } from "@/features/property-requirements/components/property-requirements-view";

export const generateMetadata = async ({
  params,
}: PageProps<"/[locale]/requirements">): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "requirements" });

  return { title: t("title") };
};

const RequirementsPage = async ({ params }: PageProps<"/[locale]/requirements">) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <DealerOnly>
      <PropertyRequirementsView />
    </DealerOnly>
  );
};

export default RequirementsPage;

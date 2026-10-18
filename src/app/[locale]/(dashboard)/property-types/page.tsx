import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RequireRole } from "@/components/layout/require-role";
import { PropertyTypesView } from "@/features/property-types/components/property-types-view";

export const generateMetadata = async ({
  params,
}: PageProps<"/[locale]/property-types">): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "propertyTypes" });

  return { title: t("title") };
};

const PropertyTypesPage = async ({ params }: PageProps<"/[locale]/property-types">) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequireRole roles={["client_admin"]}>
      <PropertyTypesView />
    </RequireRole>
  );
};

export default PropertyTypesPage;

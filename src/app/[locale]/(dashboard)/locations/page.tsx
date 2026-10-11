import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DealerOnly } from "@/components/layout/dealer-only";
import { LocationsView } from "@/features/locations/components/locations-view";

export const generateMetadata = async ({
  params,
}: PageProps<"/[locale]/locations">): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "locations" });

  return { title: t("title") };
};

const LocationsPage = async ({ params }: PageProps<"/[locale]/locations">) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <DealerOnly>
      <LocationsView />
    </DealerOnly>
  );
};

export default LocationsPage;

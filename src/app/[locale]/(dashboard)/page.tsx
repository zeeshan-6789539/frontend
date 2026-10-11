import { setRequestLocale } from "next-intl/server";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";

const DashboardPage = async ({ params }: PageProps<"/[locale]">) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DashboardView />;
};

export default DashboardPage;

import { setRequestLocale } from "next-intl/server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AssistantLauncher } from "@/features/assistant/components/assistant-launcher";

const DashboardLayout = async ({
  children,
  params,
}: LayoutProps<"/[locale]">) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-dvh">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="w-full flex-1 pt-2 px-2 pb-4 sm:px-3">
          {children}
        </main>
      </div>
      <AssistantLauncher />
    </div>
  );
};

export default DashboardLayout;

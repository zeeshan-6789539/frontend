import { setRequestLocale } from "next-intl/server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { FloatingAssistant } from "@/features/voice-assistant/components/floating-assistant";
import { VoiceAssistantProvider } from "@/features/voice-assistant/components/voice-assistant-provider";

const DashboardLayout = async ({
  children,
  params,
}: LayoutProps<"/[locale]">) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <VoiceAssistantProvider>
      <div className="flex min-h-dvh">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="w-full flex-1 pt-2 px-2 pb-4 sm:px-3">
            {children}
          </main>
        </div>
      </div>
      <FloatingAssistant />
    </VoiceAssistantProvider>
  );
};

export default DashboardLayout;

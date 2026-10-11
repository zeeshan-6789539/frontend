"use client";

import { useTranslations } from "next-intl";
import { PageHeading } from "@/components/layout/page-heading";
import { RequireRole } from "@/components/layout/require-role";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { DealerOverview } from "@/features/dashboard/components/dealer-overview";

// Super admins see the platform; client admins see their dealership
export const DashboardView = () => {
  const t = useTranslations("dashboard");
  const { data: user } = useCurrentUser();
  const isDealer = user?.role === "client_admin";
  const subtitle = isDealer ? t("dealer.subtitle") : t("subtitle");

  return (
    <div className="space-y-6">
      <PageHeading title={t("title")} description={user ? subtitle : undefined} />

      <RequireRole roles={["super_admin", "client_admin"]}>
        {isDealer ? <DealerOverview /> : <DashboardOverview />}
      </RequireRole>
    </div>
  );
};

"use client";

import { useLocale, useTranslations } from "next-intl";
import { ClipboardList, Contact, Handshake, Home } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { DashboardHero } from "@/features/dashboard/components/dashboard-hero";
import { InventoryCard } from "@/features/dashboard/components/inventory-card";
import { PipelineCard } from "@/features/dashboard/components/pipeline-card";
import { RecentPropertiesCard } from "@/features/dashboard/components/recent-properties-card";
import { RecentRequirementsCard } from "@/features/dashboard/components/recent-requirements-card";
import { useDealerStats } from "@/features/dashboard/hooks/use-dealer-stats";
import { getApiErrorMessage } from "@/utils/api";
import { formatNumber } from "@/utils/format";

export const DealerOverview = () => {
  const t = useTranslations("dashboard.dealer");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { data: user } = useCurrentUser();
  const { stats, isPending, error } = useDealerStats();

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error || !stats) return <Alert>{getApiErrorMessage(error, tCommon("error"))}</Alert>;

  return (
    <div className="space-y-6">
      <DashboardHero userName={user?.name ?? ""} companyName={user?.companyName ?? null} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("stats.activeListings")}
          value={formatNumber(stats.activeListings, locale)}
          hint={t("stats.activeListingsHint", { count: formatNumber(stats.available, locale) })}
          icon={<Home className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label={t("stats.openRequirements")}
          value={formatNumber(stats.open, locale)}
          hint={t("stats.openRequirementsHint")}
          icon={<ClipboardList className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label={t("stats.closedDeals")}
          value={formatNumber(stats.sold + stats.rented, locale)}
          hint={t("stats.closedDealsHint", {
            sold: formatNumber(stats.sold, locale),
            rented: formatNumber(stats.rented, locale),
          })}
          icon={<Handshake className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label={t("stats.contacts")}
          value={formatNumber(stats.activeContacts, locale)}
          hint={t("stats.contactsHint")}
          icon={<Contact className="h-5 w-5" aria-hidden />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InventoryCard
          available={stats.available}
          sold={stats.sold}
          rented={stats.rented}
          forSale={stats.forSale}
          forRent={stats.forRent}
        />
        <PipelineCard open={stats.open} matched={stats.matched} closed={stats.closed} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentPropertiesCard properties={stats.recentProperties} />
        <RecentRequirementsCard requirements={stats.recentRequirements} />
      </div>
    </div>
  );
};

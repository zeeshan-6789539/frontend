"use client";

import { useLocale, useTranslations } from "next-intl";
import { Building2, CircleCheck, UserCheck, Users } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { useCompanies } from "@/features/companies/hooks/use-companies";
import { useUsers } from "@/features/users/hooks/use-users";
import { Link } from "@/i18n/navigation";
import { RECENT_ITEMS_LIMIT } from "@/config/pagination";
import { getApiErrorMessage } from "@/utils/api";
import { formatDate, formatNumber } from "@/utils/format";

export const DashboardOverview = () => {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("account.roles");
  const locale = useLocale();

  const recentCompanies = useCompanies({ page: 1, limit: RECENT_ITEMS_LIMIT });
  const activeCompanies = useCompanies({ page: 1, limit: 1, status: true });
  const recentUsers = useUsers({ page: 1, limit: RECENT_ITEMS_LIMIT });
  const activeUsers = useUsers({ page: 1, limit: 1, status: true });

  const isPending =
    recentCompanies.isPending ||
    activeCompanies.isPending ||
    recentUsers.isPending ||
    activeUsers.isPending;

  const failedQuery = [recentCompanies, activeCompanies, recentUsers, activeUsers].find(
    (query) => query.isError,
  );

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (failedQuery?.isError) {
    return <Alert>{getApiErrorMessage(failedQuery.error, tCommon("error"))}</Alert>;
  }

  const companies = recentCompanies.data?.items ?? [];
  const users = recentUsers.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("stats.companies")}
          value={formatNumber(recentCompanies.data?.meta.totalItems ?? 0, locale)}
          icon={<Building2 className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label={t("stats.activeCompanies")}
          value={formatNumber(activeCompanies.data?.meta.totalItems ?? 0, locale)}
          icon={<CircleCheck className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label={t("stats.users")}
          value={formatNumber(recentUsers.data?.meta.totalItems ?? 0, locale)}
          icon={<Users className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label={t("stats.activeUsers")}
          value={formatNumber(activeUsers.data?.meta.totalItems ?? 0, locale)}
          icon={<UserCheck className="h-5 w-5" aria-hidden />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold tracking-tight">{t("recentCompanies")}</h2>
            <Link
              href="/companies"
              className="text-sm font-medium text-primary hover:underline"
            >
              {tCommon("viewAll")}
            </Link>
          </div>

          {companies.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noCompanies")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {companies.map((company) => (
                <li
                  key={company.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{company.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {company.city ?? "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={company.status ? "success" : "muted"}>
                      {company.status ? tCommon("active") : tCommon("deactivated")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(company.createdAt, locale)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold tracking-tight">{t("recentUsers")}</h2>
            <Link
              href="/users"
              className="text-sm font-medium text-primary hover:underline"
            >
              {tCommon("viewAll")}
            </Link>
          </div>

          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noUsers")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={user.role === "super_admin" ? "info" : "muted"}>
                      {tRoles(user.role)}
                    </Badge>
                    <Badge variant={user.status ? "success" : "muted"}>
                      {user.status ? tCommon("active") : tCommon("deactivated")}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

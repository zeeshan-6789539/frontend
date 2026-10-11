"use client";

import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { REQUIREMENT_STATUS_BADGE } from "@/config/property";
import { formatDate } from "@/utils/format";
import { joinLocation } from "@/utils/property";
import { getInitials, joinNames } from "@/utils/string";
import type { IRecentRequirementsCardProps } from "@/features/dashboard/types/dashboard-components";

export const RecentRequirementsCard = ({ requirements }: IRecentRequirementsCardProps) => {
  const t = useTranslations("dashboard.dealer");
  const tRequirements = useTranslations("requirements");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold tracking-tight">{t("recentRequirements")}</h2>
        <Link href="/requirements" className="text-sm font-medium text-primary hover:underline">
          {tCommon("viewAll")}
        </Link>
      </div>

      {requirements.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noRequirements")}</p>
      ) : (
        <ul className="divide-y divide-border">
          {requirements.map((requirement) => (
            <li key={requirement.id} className="flex items-center gap-3 py-2.5">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-xs font-semibold text-secondary-soft-foreground">
                {getInitials(...requirement.contactName.split(" ").slice(0, 2))}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{requirement.contactName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[
                    tRequirements(`purposes.${requirement.purpose}`),
                    requirement.propertyTypeName ?? tRequirements("anyType"),
                    joinLocation(joinNames(requirement.preferredAreas, ", "), requirement.preferredCity),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="shrink-0 space-y-1 text-end">
                <Badge variant={REQUIREMENT_STATUS_BADGE[requirement.requirementStatus]}>
                  {tRequirements(`requirementStatuses.${requirement.requirementStatus}`)}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {formatDate(requirement.createdAt, locale)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

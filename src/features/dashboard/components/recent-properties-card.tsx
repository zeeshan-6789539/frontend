"use client";

import { useLocale, useTranslations } from "next-intl";
import { Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { PROPERTY_STATUS_BADGE } from "@/config/property";
import { formatCurrency } from "@/utils/format";
import { joinLocation } from "@/utils/property";
import type { IRecentPropertiesCardProps } from "@/features/dashboard/types/dashboard-components";

export const RecentPropertiesCard = ({ properties }: IRecentPropertiesCardProps) => {
  const t = useTranslations("dashboard.dealer");
  const tProperties = useTranslations("properties");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold tracking-tight">{t("recentProperties")}</h2>
        <Link href="/properties" className="text-sm font-medium text-primary hover:underline">
          {tCommon("viewAll")}
        </Link>
      </div>

      {properties.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noProperties")}</p>
      ) : (
        <ul className="divide-y divide-border">
          {properties.map((property) => (
            <li key={property.id} className="flex items-center gap-3 py-2.5">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
                <Home className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{property.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {property.propertyTypeName} · {joinLocation(property.areaName, property.city)}
                </p>
              </div>
              <div className="shrink-0 space-y-1 text-end">
                <p className="text-sm font-semibold tabular-nums">
                  {formatCurrency(property.price, locale)}
                  {property.purpose === "rent" ? (
                    <span className="text-xs font-normal text-muted-foreground">
                      {` ${tProperties("perMonth")}`}
                    </span>
                  ) : null}
                </p>
                <Badge variant={PROPERTY_STATUS_BADGE[property.propertyStatus]}>
                  {tProperties(`propertyStatuses.${property.propertyStatus}`)}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

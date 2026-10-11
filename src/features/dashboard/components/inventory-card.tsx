"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { BreakdownSection } from "@/features/dashboard/components/breakdown-section";
import type { IInventoryCardProps } from "@/features/dashboard/types/dashboard-components";

export const InventoryCard = ({ available, sold, rented, forSale, forRent }: IInventoryCardProps) => {
  const t = useTranslations("dashboard.dealer");
  const tProperties = useTranslations("properties");
  const tCommon = useTranslations("common");

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="font-semibold tracking-tight">{t("inventory.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("inventory.subtitle")}</p>
        </div>
        <Link href="/properties" className="text-sm font-medium text-primary hover:underline">
          {tCommon("viewAll")}
        </Link>
      </div>

      <BreakdownSection
        title={t("inventory.byStatus")}
        emptyLabel={t("inventory.empty")}
        segments={[
          {
            key: "available",
            label: tProperties("propertyStatuses.available"),
            value: available,
            fillClassName: "fill-success",
            dotClassName: "bg-success",
          },
          {
            key: "sold",
            label: tProperties("propertyStatuses.sold"),
            value: sold,
            fillClassName: "fill-info",
            dotClassName: "bg-info",
          },
          {
            key: "rented",
            label: tProperties("propertyStatuses.rented"),
            value: rented,
            fillClassName: "fill-warning",
            dotClassName: "bg-warning",
          },
        ]}
      />

      <BreakdownSection
        title={t("inventory.byPurpose")}
        emptyLabel={t("inventory.empty")}
        segments={[
          {
            key: "sale",
            label: tProperties("purposes.sale"),
            value: forSale,
            fillClassName: "fill-chart-2",
            dotClassName: "bg-chart-2",
          },
          {
            key: "rent",
            label: tProperties("purposes.rent"),
            value: forRent,
            fillClassName: "fill-chart-1",
            dotClassName: "bg-chart-1",
          },
        ]}
      />
    </Card>
  );
};

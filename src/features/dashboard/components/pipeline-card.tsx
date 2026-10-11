"use client";

import { useLocale, useTranslations } from "next-intl";
import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { BreakdownSection } from "@/features/dashboard/components/breakdown-section";
import { formatNumber, formatPercent } from "@/utils/format";
import { toRatio } from "@/utils/number";
import type { IPipelineCardProps } from "@/features/dashboard/types/dashboard-components";

export const PipelineCard = ({ open, matched, closed }: IPipelineCardProps) => {
  const t = useTranslations("dashboard.dealer");
  const tRequirements = useTranslations("requirements");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const total = open + matched + closed;

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="font-semibold tracking-tight">{t("pipeline.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("pipeline.subtitle")}</p>
        </div>
        <Link href="/requirements" className="text-sm font-medium text-primary hover:underline">
          {tCommon("viewAll")}
        </Link>
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-card-muted p-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success-soft-foreground">
          <Target className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{t("pipeline.matchRate")}</p>
          <p className="text-3xl font-semibold tracking-tight tabular-nums">
            {formatPercent(toRatio(matched, total), locale)}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("pipeline.matchRateHint", {
              matched: formatNumber(matched, locale),
              total: formatNumber(total, locale),
            })}
          </p>
        </div>
      </div>

      <BreakdownSection
        title={t("pipeline.byStatus")}
        emptyLabel={t("pipeline.empty")}
        segments={[
          {
            key: "open",
            label: tRequirements("requirementStatuses.open"),
            value: open,
            fillClassName: "fill-info",
            dotClassName: "bg-info",
          },
          {
            key: "matched",
            label: tRequirements("requirementStatuses.matched"),
            value: matched,
            fillClassName: "fill-success",
            dotClassName: "bg-success",
          },
          {
            key: "closed",
            label: tRequirements("requirementStatuses.closed"),
            value: closed,
            fillClassName: "fill-muted-foreground",
            dotClassName: "bg-muted-foreground",
          },
        ]}
      />
    </Card>
  );
};

"use client";

import { useLocale } from "next-intl";
import { StackedBar } from "@/components/ui/stacked-bar";
import { formatNumber, formatPercent } from "@/utils/format";
import { sumBy, toRatio } from "@/utils/number";
import { cn } from "@/utils/cn";
import type { IBreakdownSectionProps } from "@/features/dashboard/types/dashboard-components";

export const BreakdownSection = ({ title, segments, emptyLabel }: IBreakdownSectionProps) => {
  const locale = useLocale();
  const total = sumBy(segments, (segment) => segment.value);

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </h3>
        <span className="text-sm font-semibold">{formatNumber(total, locale)}</span>
      </div>

      <StackedBar segments={segments} label={title} />

      {total === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {segments.map((segment) => (
            <li key={segment.key} className="flex items-center gap-2 text-sm">
              <span
                className={cn("h-2.5 w-2.5 shrink-0 rounded-full", segment.dotClassName)}
                aria-hidden
              />
              <span className="truncate text-muted-foreground">{segment.label}</span>
              <span className="ms-auto font-medium tabular-nums">
                {formatNumber(segment.value, locale)}
              </span>
              <span className="w-9 text-end text-xs text-muted-foreground tabular-nums">
                {formatPercent(toRatio(segment.value, total), locale)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

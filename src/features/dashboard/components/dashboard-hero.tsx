"use client";

import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, ClipboardList, Home, UserPlus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/utils/format";
import { getDayPeriod } from "@/utils/greeting";
import type { IDashboardHeroProps } from "@/features/dashboard/types/dashboard-components";

const quickActions = [
  { href: "/properties", labelKey: "addProperty", icon: Home },
  { href: "/requirements", labelKey: "addRequirement", icon: ClipboardList },
  { href: "/contacts", labelKey: "addContact", icon: UserPlus },
] as const;

export const DashboardHero = ({ userName, companyName }: IDashboardHeroProps) => {
  const t = useTranslations("dashboard.dealer");
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden rounded-card bg-brand-gradient p-6 text-primary-foreground shadow-brand sm:p-8">
      <Home
        className="pointer-events-none absolute -end-6 -bottom-10 h-48 w-48 opacity-10"
        aria-hidden
      />

      <div className="relative space-y-5">
        <div className="space-y-1.5">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium opacity-80">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {formatDate(new Date(), locale)}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t(`greeting.${getDayPeriod()}`, { name: userName })}
          </h2>
          <p className="max-w-xl text-sm opacity-85">
            {companyName
              ? t("heroSubtitle", { company: companyName })
              : t("heroSubtitleNoCompany")}
          </p>
        </div>

        <nav aria-label={t("quickActions.label")} className="flex flex-wrap gap-2">
          {quickActions.map(({ href, labelKey, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary-foreground/15 px-3.5 text-sm font-medium ring-1 ring-primary-foreground/25 transition-colors hover:bg-primary-foreground/25"
            >
              <Icon className="h-4 w-4" aria-hidden />
              {t(`quickActions.${labelKey}`)}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
};

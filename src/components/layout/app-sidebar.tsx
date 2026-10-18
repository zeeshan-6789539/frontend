"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Building2, Menu, X } from "lucide-react";
import { AppNav } from "@/components/layout/app-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { PoweredBy } from "@/components/layout/powered-by";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";

export const AppSidebar = () => {
  const tSidebar = useTranslations("sidebar");
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useCurrentUser();
  const brandName =
    user?.role !== "super_admin" && user?.companyName
      ? user.companyName
      : siteConfig.name;

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label={tSidebar("open")}
        aria-expanded={isOpen}
        className="fixed top-4 start-4 z-30 md:hidden"
      >
        <Menu className="h-4 w-4" aria-hidden />
      </Button>

      {isOpen ? (
        <div
          onClick={closeSidebar}
          aria-hidden
          className="fixed inset-0 z-40 bg-overlay backdrop-blur-sm md:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-e border-border bg-card transition-transform duration-200 md:sticky md:top-0 md:h-dvh md:shrink-0",
          !isOpen && "max-md:ltr:-translate-x-full max-md:rtl:translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
          <Link
            href="/"
            onClick={closeSidebar}
            className="flex min-w-0 items-center gap-2.5 font-semibold"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground shadow-brand">
              <Building2 className="h-4.5 w-4.5" aria-hidden />
            </span>
            <span className="truncate">{brandName}</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            aria-label={tSidebar("close")}
            className="ms-auto md:hidden"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <AppNav onNavigate={closeSidebar} />
        </div>

        <div className="shrink-0 space-y-3 border-t border-border p-3">
          <UserMenu />

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <div className="ms-auto">
              <ThemeToggle />
            </div>
          </div>

          <PoweredBy />
        </div>
      </aside>
    </>
  );
};

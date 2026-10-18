"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { navItems } from "@/config/navigation";
import { isNavItemVisible } from "@/utils/access";
import { cn } from "@/utils/cn";
import type { IAppNavProps } from "@/types/layout";

export const AppNav = ({ onNavigate }: IAppNavProps) => {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  const visibleItems = navItems.filter((item) => isNavItemVisible(item, user));

  return (
    <nav className="flex flex-col gap-1">
      {visibleItems.map(({ href, labelKey, icon: Icon }) => {
        const isActive =
          pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative inline-flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "before:absolute before:inset-y-1.5 before:start-0 before:w-0.5 before:rounded-full before:bg-primary before:transition-opacity",
              isActive
                ? "bg-accent text-accent-foreground before:opacity-100"
                : "text-muted-foreground before:opacity-0 hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {t(labelKey)}
          </Link>
        );
      })}
    </nav>
  );
};

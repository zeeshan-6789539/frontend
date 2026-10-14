"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { IAssistantSearchResultsProps } from "@/types/voice-assistant";

export const AssistantSearchResults = ({ results }: IAssistantSearchResultsProps) => {
  const t = useTranslations("assistant");

  return (
    <div className="mt-2 space-y-2">
      {results.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noResults")}</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {results.items.map((item) => (
            <li key={item.id} className="px-3 py-2">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={results.path}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        {t("openList")}
        <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
      </Link>
    </div>
  );
};

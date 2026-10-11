"use client";

import { useLocale, useTranslations } from "next-intl";
import { Pencil, Power, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/format";
import type { IAreaListProps } from "@/features/locations/types/location-components";

export const AreaList = ({ areas, onEdit, onToggleStatus }: IAreaListProps) => {
  const t = useTranslations("locations");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {areas.map((area) => (
        <li
          key={area.id}
          className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{area.name}</p>
            <p className="text-xs text-muted-foreground">
              {t("areas.addedOn", { date: formatDate(area.createdAt, locale) })}
            </p>
          </div>

          <Badge variant={area.status ? "success" : "muted"}>
            {area.status ? tCommon("active") : tCommon("deactivated")}
          </Badge>

          <div className="flex shrink-0 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(area)}
              aria-label={t("areas.edit")}
              title={t("areas.edit")}
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleStatus(area)}
              aria-label={area.status ? t("areas.deactivate") : t("areas.restore")}
              title={area.status ? t("areas.deactivate") : t("areas.restore")}
            >
              {area.status ? (
                <Power className="h-4 w-4 text-danger" aria-hidden />
              ) : (
                <RotateCcw className="h-4 w-4 text-success" aria-hidden />
              )}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
};

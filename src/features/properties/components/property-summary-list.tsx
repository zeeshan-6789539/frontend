"use client";

import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/utils/format";
import { joinLocation } from "@/utils/property";
import { joinNames } from "@/utils/string";
import type { IPropertySummaryListProps } from "@/features/properties/types/property-components";

// Compact list used where a full table would be too wide, e.g. requirement matches
export const PropertySummaryList = ({
  properties,
  renderAction,
}: IPropertySummaryListProps) => {
  const t = useTranslations("properties");
  const locale = useLocale();

  return (
    <ul className="divide-y divide-border">
      {properties.map((property) => (
        <li
          key={property.id}
          className="flex flex-wrap items-start justify-between gap-3 py-3"
        >
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium">{property.title}</p>
            <p className="text-xs text-muted-foreground">
              {property.propertyTypeName} · {joinLocation(property.areaName, property.city)}
            </p>
            <p className="text-xs text-muted-foreground">
              {[
                property.areaSqft
                  ? t("sqftValue", { value: formatNumber(property.areaSqft, locale) })
                  : "",
                joinNames(property.facilities),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {property.ownerName ? (
              <p className="text-xs text-muted-foreground">
                {t("ownerValue", {
                  name: property.ownerName,
                  phone: property.ownerPhone ?? "",
                })}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 space-y-1 text-end">
            <p className="font-semibold">{formatCurrency(property.price, locale)}</p>
            <Badge variant={property.purpose === "sale" ? "info" : "warning"}>
              {property.purpose === "rent"
                ? `${t("purposes.rent")} · ${t("perMonth")}`
                : t("purposes.sale")}
            </Badge>
            {renderAction ? <div className="pt-1">{renderAction(property)}</div> : null}
          </div>
        </li>
      ))}
    </ul>
  );
};

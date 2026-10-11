"use client";

import { useLocale, useTranslations } from "next-intl";
import { Pencil, Power, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/utils/format";
import { getAllowedListingStatuses, joinLocation } from "@/utils/property";
import { joinNames } from "@/utils/string";
import type { TPropertyStatus } from "@/types/property";
import type { IPropertiesTableProps } from "@/features/properties/types/property-components";

export const PropertiesTable = ({
  properties,
  onEdit,
  onToggleStatus,
  onChangeListingStatus,
}: IPropertiesTableProps) => {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <Table>
      <TableHead>
        <TableRow className="hover:bg-transparent">
          <TableHeaderCell>{t("fields.property")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.purpose")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.price")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.details")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.owner")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.propertyStatus")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.status")}</TableHeaderCell>
          <TableHeaderCell className="text-end">{tCommon("actions")}</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {properties.map((property) => (
          <TableRow key={property.id}>
            <TableCell>
              <p className="font-medium">{property.title}</p>
              <p className="text-xs text-muted-foreground">
                {property.propertyTypeName} · {joinLocation(property.areaName, property.city)}
              </p>
            </TableCell>

            <TableCell>
              <Badge variant={property.purpose === "sale" ? "info" : "warning"}>
                {t(`purposes.${property.purpose}`)}
              </Badge>
            </TableCell>

            <TableCell className="whitespace-nowrap">
              <p className="font-medium">{formatCurrency(property.price, locale)}</p>
              {property.purpose === "rent" ? (
                <p className="text-xs text-muted-foreground">{t("perMonth")}</p>
              ) : null}
            </TableCell>

            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
              <p>
                {property.areaSqft
                  ? t("sqftValue", { value: formatNumber(property.areaSqft, locale) })
                  : "—"}
              </p>
              {property.facilities.length > 0 ? (
                <p className="max-w-56 truncate" title={joinNames(property.facilities)}>
                  {joinNames(property.facilities)}
                </p>
              ) : null}
            </TableCell>

            <TableCell className="text-muted-foreground">
              {property.ownerName ? (
                <div className="space-y-0.5">
                  <p>{property.ownerName}</p>
                  <p className="text-xs">{property.ownerPhone}</p>
                </div>
              ) : (
                "—"
              )}
            </TableCell>

            <TableCell>
              <Select
                value={property.propertyStatus}
                onChange={(value) =>
                  onChangeListingStatus(property, value as TPropertyStatus)
                }
                options={getAllowedListingStatuses(property.purpose).map((status) => ({
                  value: status,
                  label: t(`propertyStatuses.${status}`),
                }))}
                aria-label={t("fields.propertyStatus")}
                disabled={!property.status}
                className="h-9 w-32"
              />
            </TableCell>

            <TableCell>
              <Badge variant={property.status ? "success" : "muted"}>
                {property.status ? tCommon("active") : tCommon("deactivated")}
              </Badge>
            </TableCell>

            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(property)}
                  aria-label={t("edit")}
                  title={t("edit")}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleStatus(property)}
                  aria-label={property.status ? t("deactivate") : t("restore")}
                  title={property.status ? t("deactivate") : t("restore")}
                >
                  {property.status ? (
                    <Power className="h-4 w-4 text-danger" aria-hidden />
                  ) : (
                    <RotateCcw className="h-4 w-4 text-success" aria-hidden />
                  )}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

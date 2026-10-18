"use client";

import { useLocale, useTranslations } from "next-intl";
import { Pencil, Power, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/format";
import type { IPropertiesTableProps } from "@/features/properties/types/property-components";

export const PropertiesTable = ({
  properties,
  onEdit,
  onToggleStatus,
}: IPropertiesTableProps) => {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <Table>
      <TableHead>
        <TableRow className="hover:bg-transparent">
          <TableHeaderCell>{t("fields.propertyNumber")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.name")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.propertyType")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.address")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.city")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.rentDueDay")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.tenants")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.status")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.createdAt")}</TableHeaderCell>
          <TableHeaderCell className="text-end">{tCommon("actions")}</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {properties.map((property) => (
          <TableRow key={property.id}>
            <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
              {property.propertyNumber}
            </TableCell>

            <TableCell>
              <p className="font-medium">{property.name}</p>
            </TableCell>

            <TableCell className="text-muted-foreground">
              <p>{property.propertyTypeName}</p>
            </TableCell>

            <TableCell className="text-muted-foreground">
              <div className="space-y-0.5">
                <p>{property.addressLine1}</p>
              </div>
            </TableCell>

            <TableCell className="text-muted-foreground">
              <p>{property.city}</p>
            </TableCell>

            <TableCell className="whitespace-nowrap text-muted-foreground">
              <p>{t("rentDueDayOption", { day: property.rentDueDay })}</p>
            </TableCell>

            <TableCell className="text-muted-foreground">
              {property.tenants.length > 0 ? (
                <div className="space-y-0.5">
                  {property.tenants.map((tenant) => (
                    <p key={tenant.id}>{tenant.name}</p>
                  ))}
                </div>
              ) : (
                <p>—</p>
              )}
            </TableCell>

            <TableCell>
              <Badge variant={property.status ? "success" : "muted"}>
                {property.status ? tCommon("active") : tCommon("deactivated")}
              </Badge>
            </TableCell>

            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatDate(property.createdAt, locale)}
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

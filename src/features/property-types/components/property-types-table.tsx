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
import type { IPropertyTypesTableProps } from "@/features/property-types/types/property-type-components";

export const PropertyTypesTable = ({
  propertyTypes,
  onEdit,
  onToggleStatus,
}: IPropertyTypesTableProps) => {
  const t = useTranslations("propertyTypes");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <Table>
      <TableHead>
        <TableRow className="hover:bg-transparent">
          <TableHeaderCell>{t("fields.name")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.source")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.status")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.createdAt")}</TableHeaderCell>
          <TableHeaderCell className="text-end">{tCommon("actions")}</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {propertyTypes.map((propertyType) => (
          <TableRow key={propertyType.id}>
            <TableCell>
              <p className="font-medium">{propertyType.name}</p>
            </TableCell>

            <TableCell>
              <Badge variant={propertyType.isBuiltIn ? "muted" : "info"}>
                {propertyType.isBuiltIn ? t("builtIn") : t("custom")}
              </Badge>
            </TableCell>

            <TableCell>
              <Badge variant={propertyType.status ? "success" : "muted"}>
                {propertyType.status ? tCommon("active") : tCommon("deactivated")}
              </Badge>
            </TableCell>

            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatDate(propertyType.createdAt, locale)}
            </TableCell>

            <TableCell>
              {propertyType.isBuiltIn ? (
                <p className="text-end text-xs text-muted-foreground">{t("builtInLocked")}</p>
              ) : (
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(propertyType)}
                    aria-label={t("edit")}
                    title={t("edit")}
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleStatus(propertyType)}
                    aria-label={propertyType.status ? t("deactivate") : t("restore")}
                    title={propertyType.status ? t("deactivate") : t("restore")}
                  >
                    {propertyType.status ? (
                      <Power className="h-4 w-4 text-danger" aria-hidden />
                    ) : (
                      <RotateCcw className="h-4 w-4 text-success" aria-hidden />
                    )}
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

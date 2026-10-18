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
import type { IFacilitiesTableProps } from "@/features/facilities/types/facility-components";

export const FacilitiesTable = ({
  facilities,
  onEdit,
  onToggleStatus,
}: IFacilitiesTableProps) => {
  const t = useTranslations("facilities");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <Table>
      <TableHead>
        <TableRow className="hover:bg-transparent">
          <TableHeaderCell>{t("fields.name")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.status")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.createdAt")}</TableHeaderCell>
          <TableHeaderCell className="text-end">{tCommon("actions")}</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {facilities.map((facility) => (
          <TableRow key={facility.id}>
            <TableCell>
              <p className="font-medium">{facility.name}</p>
            </TableCell>

            <TableCell>
              <Badge variant={facility.status ? "success" : "muted"}>
                {facility.status ? tCommon("active") : tCommon("deactivated")}
              </Badge>
            </TableCell>

            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatDate(facility.createdAt, locale)}
            </TableCell>

            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(facility)}
                  aria-label={t("edit")}
                  title={t("edit")}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleStatus(facility)}
                  aria-label={facility.status ? t("deactivate") : t("restore")}
                  title={facility.status ? t("deactivate") : t("restore")}
                >
                  {facility.status ? (
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

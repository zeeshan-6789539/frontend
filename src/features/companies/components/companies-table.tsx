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
import type { ICompaniesTableProps } from "@/features/companies/types/company-components";

export const CompaniesTable = ({
  companies,
  onEdit,
  onToggleStatus,
}: ICompaniesTableProps) => {
  const t = useTranslations("companies");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <Table>
      <TableHead>
        <TableRow className="hover:bg-transparent">
          <TableHeaderCell>{t("fields.name")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.contact")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.location")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.voiceAssistant")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.status")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.createdAt")}</TableHeaderCell>
          <TableHeaderCell className="text-end">{tCommon("actions")}</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {companies.map((company) => (
          <TableRow key={company.id}>
            <TableCell>
              <p className="font-medium">{company.name}</p>
            </TableCell>

            <TableCell className="text-muted-foreground">
              <div className="space-y-0.5">
                <p>{company.email ?? "—"}</p>
                <p className="text-xs">{company.phone ?? "—"}</p>
              </div>
            </TableCell>

            <TableCell className="text-muted-foreground">
              <p>{company.city ?? "—"}</p>
            </TableCell>

            <TableCell>
              <Badge variant={company.voiceAssistantEnabled ? "success" : "muted"}>
                {company.voiceAssistantEnabled ? tCommon("yes") : tCommon("no")}
              </Badge>
            </TableCell>

            <TableCell>
              <Badge variant={company.status ? "success" : "muted"}>
                {company.status ? tCommon("active") : tCommon("deactivated")}
              </Badge>
            </TableCell>

            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatDate(company.createdAt, locale)}
            </TableCell>

            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(company)}
                  aria-label={t("edit")}
                  title={t("edit")}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleStatus(company)}
                  aria-label={company.status ? t("deactivate") : t("restore")}
                  title={company.status ? t("deactivate") : t("restore")}
                >
                  {company.status ? (
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

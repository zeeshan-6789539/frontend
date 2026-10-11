"use client";

import { useLocale, useTranslations } from "next-intl";
import { Pencil, Power, RotateCcw, Search } from "lucide-react";
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
import { REQUIREMENT_STATUSES } from "@/config/property";
import { formatCurrency } from "@/utils/format";
import { joinLocation } from "@/utils/property";
import { joinNames } from "@/utils/string";
import type { TRequirementStatus } from "@/types/property";
import type { IPropertyRequirement } from "@/types/property-requirement";
import type { IPropertyRequirementsTableProps } from "@/features/property-requirements/types/property-requirement-components";

export const PropertyRequirementsTable = ({
  requirements,
  onEdit,
  onToggleStatus,
  onShowMatches,
  onChangeProgress,
}: IPropertyRequirementsTableProps) => {
  const t = useTranslations("requirements");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const progressOptions = REQUIREMENT_STATUSES.map((status) => ({
    value: status,
    label: t(`requirementStatuses.${status}`),
  }));

  const formatBudget = ({ budgetMin, budgetMax }: IPropertyRequirement): string => {
    if (budgetMin !== null && budgetMax !== null) {
      return `${formatCurrency(budgetMin, locale)} – ${formatCurrency(budgetMax, locale)}`;
    }
    if (budgetMax !== null) return t("budgetUpTo", { value: formatCurrency(budgetMax, locale) });
    if (budgetMin !== null) return t("budgetFrom", { value: formatCurrency(budgetMin, locale) });

    return t("budgetAny");
  };

  return (
    <Table>
      <TableHead>
        <TableRow className="hover:bg-transparent">
          <TableHeaderCell>{t("fields.seeker")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.lookingFor")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.budget")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.location")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.requirementStatus")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.status")}</TableHeaderCell>
          <TableHeaderCell className="text-end">{tCommon("actions")}</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {requirements.map((requirement) => (
          <TableRow key={requirement.id}>
            <TableCell>
              <p className="font-medium">{requirement.contactName}</p>
              <p className="text-xs text-muted-foreground">{requirement.contactPhone}</p>
            </TableCell>

            <TableCell>
              <div className="flex flex-wrap items-center gap-1">
                <Badge variant={requirement.purpose === "buy" ? "info" : "warning"}>
                  {t(`purposes.${requirement.purpose}`)}
                </Badge>
                <span className="text-sm">
                  {requirement.propertyTypeName ?? t("anyType")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {joinNames(requirement.facilities)}
              </p>
            </TableCell>

            <TableCell className="whitespace-nowrap text-sm">
              {formatBudget(requirement)}
            </TableCell>

            <TableCell className="text-muted-foreground">
              {joinLocation(joinNames(requirement.preferredAreas, ", "), requirement.preferredCity) || "—"}
            </TableCell>

            <TableCell>
              <Select
                value={requirement.requirementStatus}
                onChange={(value) =>
                  onChangeProgress(requirement, value as TRequirementStatus)
                }
                options={progressOptions}
                aria-label={t("fields.requirementStatus")}
                disabled={!requirement.status}
                className="h-9 w-32"
              />
              {requirement.matchedPropertyTitle ? (
                <p className="mt-1 max-w-48 truncate text-xs text-muted-foreground">
                  {t("chosenProperty", { property: requirement.matchedPropertyTitle })}
                </p>
              ) : null}
            </TableCell>

            <TableCell>
              <Badge variant={requirement.status ? "success" : "muted"}>
                {requirement.status ? tCommon("active") : tCommon("deactivated")}
              </Badge>
            </TableCell>

            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => onShowMatches(requirement)}
                  title={t("showMatches")}
                >
                  <Search className="h-4 w-4" aria-hidden />
                  {t("matches")}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(requirement)}
                  aria-label={t("edit")}
                  title={t("edit")}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleStatus(requirement)}
                  aria-label={requirement.status ? t("deactivate") : t("restore")}
                  title={requirement.status ? t("deactivate") : t("restore")}
                >
                  {requirement.status ? (
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

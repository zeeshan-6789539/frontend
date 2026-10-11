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
import type { IContactsTableProps } from "@/features/contacts/types/contact-components";

export const ContactsTable = ({ contacts, onEdit, onToggleStatus }: IContactsTableProps) => {
  const t = useTranslations("contacts");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <Table>
      <TableHead>
        <TableRow className="hover:bg-transparent">
          <TableHeaderCell>{t("fields.name")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.contact")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.cnic")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.status")}</TableHeaderCell>
          <TableHeaderCell>{t("fields.createdAt")}</TableHeaderCell>
          <TableHeaderCell className="text-end">{tCommon("actions")}</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {contacts.map((contact) => (
          <TableRow key={contact.id}>
            <TableCell>
              <p className="font-medium">{contact.name}</p>
              {contact.notes ? (
                <p className="max-w-xs truncate text-xs text-muted-foreground">
                  {contact.notes}
                </p>
              ) : null}
            </TableCell>

            <TableCell className="text-muted-foreground">
              <div className="space-y-0.5">
                <p>{contact.phone}</p>
                <p className="text-xs">{contact.email ?? "—"}</p>
              </div>
            </TableCell>

            <TableCell className="whitespace-nowrap text-muted-foreground">
              {contact.cnic ?? "—"}
            </TableCell>

            <TableCell>
              <Badge variant={contact.status ? "success" : "muted"}>
                {contact.status ? tCommon("active") : tCommon("deactivated")}
              </Badge>
            </TableCell>

            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatDate(contact.createdAt, locale)}
            </TableCell>

            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(contact)}
                  aria-label={t("edit")}
                  title={t("edit")}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleStatus(contact)}
                  aria-label={contact.status ? t("deactivate") : t("restore")}
                  title={contact.status ? t("deactivate") : t("restore")}
                >
                  {contact.status ? (
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

"use client";

import { useTranslations } from "next-intl";
import { Alert } from "@/components/ui/alert";
import { RequireRole } from "@/components/layout/require-role";
import type { IDealerOnlyProps } from "@/types/layout";

// Dealer screens are for client admins, whose company is the dealership
export const DealerOnly = ({ children }: IDealerOnlyProps) => {
  const t = useTranslations("account");

  return (
    <RequireRole
      roles={["client_admin"]}
      fallback={<Alert variant="info">{t("noDealerAccess")}</Alert>}
    >
      {children}
    </RequireRole>
  );
};

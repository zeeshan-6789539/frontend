"use client";

import { useTranslations } from "next-intl";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { getApiErrorMessage } from "@/utils/api";
import type { IRequireRoleProps } from "@/types/layout";

// The backend enforces the real rule — this keeps the UI honest about it
export const RequireRole = ({
  roles,
  isAllowed,
  children,
  fallback,
}: IRequireRoleProps) => {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const { data: user, isPending, isError, error } = useCurrentUser();

  if (isPending) return <Skeleton className="h-64" />;

  if (isError) return <Alert>{getApiErrorMessage(error, tCommon("error"))}</Alert>;

  if (!user || !roles.includes(user.role) || (isAllowed && !isAllowed(user))) {
    return fallback ?? <Alert variant="info">{t("noAccess")}</Alert>;
  }

  return children;
};

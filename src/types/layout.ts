import type { ReactNode } from "react";
import type { IUser, TUserRole } from "@/types/user";

export interface IAppNavProps {
  onNavigate?: () => void;
}

export interface IPageHeadingProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export interface IRequireRoleProps {
  roles: readonly TUserRole[];
  // Extra per-user check on top of roles, e.g. a company feature flag
  isAllowed?: (user: IUser) => boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export interface IDealerOnlyProps {
  children: ReactNode;
}

export interface IAssistantOnlyProps {
  children: ReactNode;
}

import type { ReactNode } from "react";
import type { TUserRole } from "@/types/user";

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
  children: ReactNode;
  fallback?: ReactNode;
}

export interface IDealerOnlyProps {
  children: ReactNode;
}

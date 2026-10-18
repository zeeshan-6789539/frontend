import { Building2, FileText, LayoutDashboard, Tags, Users } from "lucide-react";
import type { INavItem } from "@/types/navigation";

export const navItems: readonly INavItem[] = [
  { href: "/", labelKey: "dashboard", icon: LayoutDashboard },
  {
    href: "/companies",
    labelKey: "companies",
    icon: Building2,
    roles: ["super_admin"],
  },
  { href: "/users", labelKey: "users", icon: Users, roles: ["super_admin"] },
  {
    href: "/properties",
    labelKey: "properties",
    icon: Building2,
    roles: ["client_admin"],
  },
  {
    href: "/property-types",
    labelKey: "propertyTypes",
    icon: Tags,
    roles: ["client_admin"],
  },
  {
    href: "/tenants",
    labelKey: "tenants",
    icon: Users,
    roles: ["client_admin"],
  },
  {
    href: "/leases",
    labelKey: "leases",
    icon: FileText,
    roles: ["client_admin"],
  },
];

import {
  Building2,
  ClipboardList,
  Contact,
  Home,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  Sparkles,
  Tags,
  Users,
} from "lucide-react";
import type { INavItem } from "@/types/navigation";

export const navItems: readonly INavItem[] = [
  { href: "/", labelKey: "dashboard", icon: LayoutDashboard },
  {
    href: "/assistant",
    labelKey: "assistant",
    icon: Sparkles,
    roles: ["super_admin", "client_admin"],
  },
  {
    href: "/companies",
    labelKey: "companies",
    icon: Building2,
    roles: ["super_admin"],
  },
  { href: "/users", labelKey: "users", icon: Users, roles: ["super_admin"] },
  { href: "/properties", labelKey: "properties", icon: Home, roles: ["client_admin"] },
  {
    href: "/requirements",
    labelKey: "requirements",
    icon: ClipboardList,
    roles: ["client_admin"],
  },
  { href: "/contacts", labelKey: "contacts", icon: Contact, roles: ["client_admin"] },
  {
    href: "/property-types",
    labelKey: "propertyTypes",
    icon: Tags,
    roles: ["client_admin"],
  },
  {
    href: "/locations",
    labelKey: "locations",
    icon: MapPinned,
    roles: ["client_admin"],
  },
  {
    href: "/facilities",
    labelKey: "facilities",
    icon: ListChecks,
    roles: ["client_admin"],
  },
];

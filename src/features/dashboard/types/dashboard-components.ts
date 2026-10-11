import type { IStackedBarSegment } from "@/types/ui";
import type { IProperty } from "@/types/property";
import type { IPropertyRequirement } from "@/types/property-requirement";

export interface IDashboardHeroProps {
  userName: string;
  companyName: string | null;
}

export interface IBreakdownSectionProps {
  title: string;
  segments: readonly IStackedBarSegment[];
  emptyLabel: string;
}

export interface IRecentPropertiesCardProps {
  properties: readonly IProperty[];
}

export interface IRecentRequirementsCardProps {
  requirements: readonly IPropertyRequirement[];
}

export interface IInventoryCardProps {
  available: number;
  sold: number;
  rented: number;
  forSale: number;
  forRent: number;
}

export interface IPipelineCardProps {
  open: number;
  matched: number;
  closed: number;
}

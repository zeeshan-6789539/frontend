import type {
  MATCH_LEVELS,
  PROPERTY_PURPOSES,
  PROPERTY_STATUSES,
  REQUIREMENT_PURPOSES,
  REQUIREMENT_STATUSES,
} from "@/config/property";
import type { IFacilitySummary } from "@/types/facility";

export type TPropertyPurpose = (typeof PROPERTY_PURPOSES)[number];
export type TPropertyStatus = (typeof PROPERTY_STATUSES)[number];
export type TRequirementPurpose = (typeof REQUIREMENT_PURPOSES)[number];
export type TRequirementStatus = (typeof REQUIREMENT_STATUSES)[number];
export type TMatchLevel = (typeof MATCH_LEVELS)[number];

export interface IProperty {
  id: string;
  propertyTypeId: string;
  propertyTypeName: string;
  ownerContactId: string | null;
  ownerName: string | null;
  ownerPhone: string | null;
  title: string;
  description: string | null;
  purpose: TPropertyPurpose;
  price: number;
  securityDeposit: number | null;
  areaSqft: number | null;
  facilities: IFacilitySummary[];
  floor: string | null;
  cityId: string;
  // City and area names, resolved by the API
  city: string;
  areaId: string | null;
  areaName: string | null;
  address: string | null;
  propertyStatus: TPropertyStatus;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPropertyQueryParams {
  page: number;
  limit: number;
  search?: string;
  purpose?: TPropertyPurpose;
  propertyTypeId?: string;
  propertyStatus?: TPropertyStatus;
  status?: boolean;
}

// null clears an optional column on update
export interface IPropertyPayload {
  propertyTypeId: string;
  ownerContactId: string | null;
  title: string;
  description: string | null;
  purpose: TPropertyPurpose;
  price: number;
  securityDeposit: number | null;
  areaSqft: number | null;
  facilityIds: string[];
  floor: string | null;
  cityId: string;
  areaId: string | null;
  address: string | null;
  propertyStatus: TPropertyStatus;
  status: boolean;
}

export interface ISavePropertyArgs {
  id?: string;
  payload: IPropertyPayload;
}

export interface IPropertyStatusChangeArgs {
  id: string;
  propertyStatus: TPropertyStatus;
}

// Numeric inputs are kept as text while editing and parsed on submit
export interface IPropertyFormValues {
  propertyTypeId: string;
  ownerContactId: string;
  title: string;
  description: string;
  purpose: TPropertyPurpose;
  price: string;
  securityDeposit: string;
  areaSqft: string;
  facilityIds: string[];
  floor: string;
  cityId: string;
  areaId: string;
  address: string;
  propertyStatus: TPropertyStatus;
  status: boolean;
}

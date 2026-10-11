import type { IAreaSummary } from "@/types/area";
import type { IFacilitySummary } from "@/types/facility";
import type { TRequirementPurpose, TRequirementStatus } from "@/types/property";

export interface IPropertyRequirement {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  propertyTypeId: string | null;
  propertyTypeName: string | null;
  purpose: TRequirementPurpose;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredCityId: string | null;
  // City name, resolved by the API
  preferredCity: string | null;
  // Empty means anywhere in the city
  preferredAreas: IAreaSummary[];
  facilities: IFacilitySummary[];
  notes: string | null;
  requirementStatus: TRequirementStatus;
  matchedPropertyId: string | null;
  matchedPropertyTitle: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPropertyRequirementQueryParams {
  page: number;
  limit: number;
  search?: string;
  purpose?: TRequirementPurpose;
  requirementStatus?: TRequirementStatus;
  status?: boolean;
}

export interface IRequirementMatchQueryParams {
  page: number;
  limit: number;
}

// null clears an optional column on update
export interface IPropertyRequirementPayload {
  contactId: string;
  propertyTypeId: string | null;
  purpose: TRequirementPurpose;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredCityId: string | null;
  preferredAreaIds: string[];
  facilityIds: string[];
  notes: string | null;
  requirementStatus: TRequirementStatus;
  status: boolean;
}

export interface ISavePropertyRequirementArgs {
  id?: string;
  payload: IPropertyRequirementPayload;
}

export interface IRequirementStatusChangeArgs {
  id: string;
  requirementStatus: TRequirementStatus;
}

export interface IMatchRequirementArgs {
  id: string;
  propertyId: string;
}

// Numeric inputs are kept as text while editing and parsed on submit
export interface IPropertyRequirementFormValues {
  contactId: string;
  propertyTypeId: string;
  purpose: TRequirementPurpose;
  budgetMin: string;
  budgetMax: string;
  preferredCityId: string;
  preferredAreaIds: string[];
  facilityIds: string[];
  notes: string;
  requirementStatus: TRequirementStatus;
  status: boolean;
}

import type { TSortOrder } from "@/types/query-params";

export interface IPropertyType {
  id: string;
  companyId: string;
  name: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPropertyTypeFilters {
  search?: string;
  status?: boolean;
  sortOrder?: TSortOrder;
}

export interface IPropertyTypeQueryParams extends IPropertyTypeFilters {
  page: number;
  limit: number;
}

export interface IPropertyTypePayload {
  name: string;
  status: boolean;
}

export interface ISavePropertyTypeArgs {
  id?: string;
  payload: IPropertyTypePayload;
}

export interface IPropertyTypeFormValues {
  name: string;
  status: boolean;
}

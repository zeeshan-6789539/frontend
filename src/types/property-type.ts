export interface IPropertyType {
  id: string;
  name: string;
  isBuiltIn: boolean;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPropertyTypeQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: boolean;
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

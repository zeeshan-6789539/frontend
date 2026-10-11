export interface IArea {
  id: string;
  cityId: string;
  cityName: string;
  name: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

// How a requirement carries its preferred areas
export interface IAreaSummary {
  id: string;
  name: string;
}

export interface IAreaQueryParams {
  page: number;
  limit: number;
  search?: string;
  cityId?: string;
  status?: boolean;
}

export interface IAreaPayload {
  cityId: string;
  name: string;
  status: boolean;
}

export interface ISaveAreaArgs {
  id?: string;
  payload: IAreaPayload;
}

export interface IAreaFormValues {
  cityId: string;
  name: string;
  status: boolean;
}

export interface ICity {
  id: string;
  name: string;
  // Active areas only
  areaCount: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICityQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: boolean;
}

export interface ICityPayload {
  name: string;
  status: boolean;
}

export interface ISaveCityArgs {
  id?: string;
  payload: ICityPayload;
}

export interface ICityFormValues {
  name: string;
  status: boolean;
}

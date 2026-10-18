export interface IFacility {
  id: string;
  name: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

// How a listing or requirement carries its facilities
export interface IFacilitySummary {
  id: string;
  name: string;
}

export interface IFacilityQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: boolean;
}

export interface IFacilityPayload {
  name: string;
  status: boolean;
}

export interface ISaveFacilityArgs {
  id?: string;
  payload: IFacilityPayload;
}

export interface IFacilityFormValues {
  name: string;
  status: boolean;
}

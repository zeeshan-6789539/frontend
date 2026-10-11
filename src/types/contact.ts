export interface IContact {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  cnic: string | null;
  address: string | null;
  notes: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IContactQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: boolean;
}

// null clears an optional column on update
export interface IContactPayload {
  name: string;
  phone: string;
  email: string | null;
  cnic: string | null;
  address: string | null;
  notes: string | null;
  status: boolean;
}

export interface ISaveContactArgs {
  id?: string;
  payload: IContactPayload;
}

export interface IContactFormValues {
  name: string;
  phone: string;
  email: string;
  cnic: string;
  address: string;
  notes: string;
  status: boolean;
}

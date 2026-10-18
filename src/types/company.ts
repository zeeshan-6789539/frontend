export interface ICompany {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  status: boolean;
  voiceAssistantEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICompanyFilters {
  search?: string;
  city?: string;
  status?: boolean;
}

export interface ICompanyQueryParams extends ICompanyFilters {
  page: number;
  limit: number;
}

export interface ICompanyPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  status: boolean;
  voiceAssistantEnabled: boolean;
}

export interface ISaveCompanyArgs {
  id?: string;
  payload: ICompanyPayload;
}

export interface ICompanyFormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  status: boolean;
  voiceAssistantEnabled: boolean;
}

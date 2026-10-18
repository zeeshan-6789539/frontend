export interface ICompany {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  status: boolean;
  invoiceMailSend: boolean;
  voiceAssistantEnabled: boolean;
  hasMailPassword: boolean;
  createdAt: string;
  updatedAt: string;
  propertyCount: number;
  tenantCount: number;
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
  invoiceMailSend: boolean;
  voiceAssistantEnabled: boolean;
  mailPassword?: string;
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
  invoiceMailSend: boolean;
  voiceAssistantEnabled: boolean;
  mailPassword: string;
}

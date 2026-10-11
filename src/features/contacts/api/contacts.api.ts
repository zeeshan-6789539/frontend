import { apiClient } from "@/lib/api-client";
import { buildQueryParams } from "@/utils/query-params";
import type { IPaginatedResult } from "@/types/api";
import type { IContact, IContactPayload, IContactQueryParams } from "@/types/contact";

const CONTACTS_PATH = "/contacts";

export const fetchContacts = async (
  params: IContactQueryParams,
): Promise<IPaginatedResult<IContact>> => {
  const { data } = await apiClient.get<IPaginatedResult<IContact>>(CONTACTS_PATH, {
    params: buildQueryParams({ ...params }),
  });

  return data;
};

export const createContact = async (payload: IContactPayload): Promise<IContact> => {
  const { data } = await apiClient.post<IContact>(CONTACTS_PATH, payload);
  return data;
};

export const updateContact = async (
  id: string,
  payload: IContactPayload,
): Promise<IContact> => {
  const { data } = await apiClient.patch<IContact>(`${CONTACTS_PATH}/${id}`, payload);
  return data;
};

// DELETE deactivates — the row is kept so it can be restored
export const deactivateContact = async (id: string): Promise<IContact> => {
  const { data } = await apiClient.delete<IContact>(`${CONTACTS_PATH}/${id}`);
  return data;
};

export const restoreContact = async (id: string): Promise<IContact> => {
  const { data } = await apiClient.patch<IContact>(`${CONTACTS_PATH}/${id}/restore`);
  return data;
};

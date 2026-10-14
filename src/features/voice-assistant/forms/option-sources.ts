import { MAX_PAGE_SIZE } from "@/config/pagination";
import {
  PROPERTY_PURPOSES,
  PROPERTY_STATUSES,
  REQUIREMENT_PURPOSES,
  REQUIREMENT_STATUSES,
} from "@/config/property";
import { contactKeys } from "@/features/contacts/api/contact-keys";
import { fetchContacts } from "@/features/contacts/api/contacts.api";
import { facilityKeys } from "@/features/facilities/api/facility-keys";
import { fetchFacilities } from "@/features/facilities/api/facilities.api";
import { fetchAreas } from "@/features/locations/api/areas.api";
import { fetchCities } from "@/features/locations/api/cities.api";
import { areaKeys, cityKeys } from "@/features/locations/api/location-keys";
import { propertyTypeKeys } from "@/features/property-types/api/property-type-keys";
import { fetchPropertyTypes } from "@/features/property-types/api/property-types.api";
import { toSelectOptions } from "@/utils/options";
import type { ISelectOption } from "@/types/ui";
import type {
  IAssistantOptionSourceDef,
  TAssistantOptionSource,
} from "@/types/voice-assistant";

const ACTIVE_PAGE = { page: 1, limit: MAX_PAGE_SIZE, status: true } as const;

const toEnumOptions = (
  values: readonly string[],
  labelPrefix: string,
  translate: (key: string) => string,
): ISelectOption[] =>
  values.map((value) => ({ value, label: translate(`${labelPrefix}.${value}`) }));

export const optionSources: Record<TAssistantOptionSource, IAssistantOptionSourceDef> = {
  propertyTypes: {
    load: async ({ queryClient }) => {
      const result = await queryClient.fetchQuery({
        queryKey: propertyTypeKeys.list(ACTIVE_PAGE),
        queryFn: () => fetchPropertyTypes(ACTIVE_PAGE),
      });
      return toSelectOptions(result.items);
    },
  },
  cities: {
    load: async ({ queryClient }) => {
      const result = await queryClient.fetchQuery({
        queryKey: cityKeys.list(ACTIVE_PAGE),
        queryFn: () => fetchCities(ACTIVE_PAGE),
      });
      return toSelectOptions(result.items);
    },
  },
  areas: {
    load: async ({ queryClient, dependencyValue: cityId }) => {
      if (cityId === "") return [];

      const params = { ...ACTIVE_PAGE, cityId };
      const result = await queryClient.fetchQuery({
        queryKey: areaKeys.list(params),
        queryFn: () => fetchAreas(params),
      });
      return toSelectOptions(result.items.filter((area) => area.cityId === cityId));
    },
  },
  contacts: {
    searchesServer: true,
    load: async ({ queryClient, search }) => {
      const params = { ...ACTIVE_PAGE, ...(search ? { search } : {}) };
      const result = await queryClient.fetchQuery({
        queryKey: contactKeys.list(params),
        queryFn: () => fetchContacts(params),
      });
      return result.items.map((contact) => ({
        value: contact.id,
        label: `${contact.name} · ${contact.phone}`,
      }));
    },
  },
  facilities: {
    load: async ({ queryClient }) => {
      const result = await queryClient.fetchQuery({
        queryKey: facilityKeys.list(ACTIVE_PAGE),
        queryFn: () => fetchFacilities(ACTIVE_PAGE),
      });
      return toSelectOptions(result.items);
    },
  },
  propertyPurposes: {
    load: async ({ translate }) => toEnumOptions(PROPERTY_PURPOSES, "properties.purposes", translate),
  },
  propertyStatuses: {
    load: async ({ translate }) =>
      toEnumOptions(PROPERTY_STATUSES, "properties.propertyStatuses", translate),
  },
  requirementPurposes: {
    load: async ({ translate }) =>
      toEnumOptions(REQUIREMENT_PURPOSES, "requirements.purposes", translate),
  },
  requirementStatuses: {
    load: async ({ translate }) =>
      toEnumOptions(REQUIREMENT_STATUSES, "requirements.requirementStatuses", translate),
  },
};

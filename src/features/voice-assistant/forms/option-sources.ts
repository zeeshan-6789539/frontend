import { MAX_PAGE_SIZE } from "@/config/pagination";
import { leaseKeys } from "@/features/leases/api/lease-keys";
import { fetchLeases } from "@/features/leases/api/leases.api";
import { propertyKeys } from "@/features/properties/api/property-keys";
import { fetchProperties } from "@/features/properties/api/properties.api";
import { propertyTypeKeys } from "@/features/property-types/api/property-type-keys";
import { fetchPropertyTypes } from "@/features/property-types/api/property-types.api";
import { tenantKeys } from "@/features/tenants/api/tenant-keys";
import { fetchTenants } from "@/features/tenants/api/tenants.api";
import { buildLeaseLabel } from "@/utils/lease";
import { buildPropertyLabel } from "@/utils/property";
import type { TPaymentMethod } from "@/types/payment";
import type { ISelectOption } from "@/types/ui";
import type {
  IAssistantOptionSourceDef,
  TAssistantOptionSource,
} from "@/types/voice-assistant";

const FIRST_PAGE = { page: 1, limit: MAX_PAGE_SIZE } as const;

const PAYMENT_METHODS: readonly TPaymentMethod[] = ["cash", "bank_transfer", "cheque", "online"];

const toEnumOptions = (
  values: readonly string[],
  labelPrefix: string,
  translate: (key: string) => string,
): ISelectOption[] =>
  values.map((value) => ({ value, label: translate(`${labelPrefix}.${value}`) }));

const withSearch = (search: string | undefined) => (search ? { search } : {});

export const optionSources: Record<TAssistantOptionSource, IAssistantOptionSourceDef> = {
  propertyTypes: {
    load: async ({ queryClient }) => {
      const params = { ...FIRST_PAGE, status: true, sortOrder: "asc" as const };
      const result = await queryClient.fetchQuery({
        queryKey: propertyTypeKeys.list(params),
        queryFn: () => fetchPropertyTypes(params),
      });
      return result.items.map((propertyType) => ({
        value: propertyType.id,
        label: propertyType.name,
      }));
    },
  },
  paymentMethods: {
    load: async ({ translate }) => toEnumOptions(PAYMENT_METHODS, "payments.methods", translate),
  },
  properties: {
    searchesServer: true,
    load: async ({ queryClient, search }) => {
      const params = { ...FIRST_PAGE, status: true, ...withSearch(search) };
      const result = await queryClient.fetchQuery({
        queryKey: propertyKeys.list(params),
        queryFn: () => fetchProperties(params),
      });
      return result.items.map((property) => ({
        value: property.id,
        label: buildPropertyLabel(property),
      }));
    },
  },
  tenants: {
    searchesServer: true,
    load: async ({ queryClient, search }) => {
      const params = { ...FIRST_PAGE, status: true, ...withSearch(search) };
      const result = await queryClient.fetchQuery({
        queryKey: tenantKeys.list(params),
        queryFn: () => fetchTenants(params),
      });
      return result.items.map((tenant) => ({ value: tenant.id, label: tenant.name }));
    },
  },
  leases: {
    searchesServer: true,
    load: async ({ queryClient, search }) => {
      const params = { ...FIRST_PAGE, status: "active" as const, ...withSearch(search) };
      const result = await queryClient.fetchQuery({
        queryKey: leaseKeys.list(params),
        queryFn: () => fetchLeases(params),
      });
      return result.items.map((lease) => ({ value: lease.id, label: buildLeaseLabel(lease) }));
    },
  },
};

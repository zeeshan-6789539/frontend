import { ASSISTANT_SEARCH_LIMIT } from "@/config/assistant";
import { fetchLeases } from "@/features/leases/api/leases.api";
import { fetchPayments } from "@/features/payments/api/payments.api";
import { fetchProperties } from "@/features/properties/api/properties.api";
import { fetchPropertyTypes } from "@/features/property-types/api/property-types.api";
import { fetchTenants } from "@/features/tenants/api/tenants.api";
import { formatNumber } from "@/utils/format";
import { buildLeaseLabel } from "@/utils/lease";
import { buildPropertyLabel } from "@/utils/property";
import type { IAssistantSearchResults, TAssistantSearchModule } from "@/types/voice-assistant";

const formatRupees = (amount: string | null, locale: string): string | null =>
  amount === null ? null : `PKR ${formatNumber(Number(amount), locale)}`;

export const searchRecords = async (
  module: TAssistantSearchModule,
  query: string,
  locale: string,
): Promise<IAssistantSearchResults> => {
  const params = {
    page: 1,
    limit: ASSISTANT_SEARCH_LIMIT,
    ...(query.trim() ? { search: query.trim() } : {}),
  };

  if (module === "properties") {
    const result = await fetchProperties(params);
    return {
      module,
      query,
      path: "/properties",
      total: result.meta.totalItems,
      items: result.items.map((property) => ({
        id: property.id,
        title: buildPropertyLabel(property),
        subtitle: [
          property.propertyTypeName,
          property.city,
          property.tenants.map((tenant) => tenant.name).join(", ") || "vacant",
        ].join(" · "),
      })),
    };
  }

  if (module === "propertyTypes") {
    const result = await fetchPropertyTypes(params);
    return {
      module,
      query,
      path: "/property-types",
      total: result.meta.totalItems,
      items: result.items.map((propertyType) => ({
        id: propertyType.id,
        title: propertyType.name,
        subtitle: propertyType.status ? "active" : "deactivated",
      })),
    };
  }

  if (module === "tenants") {
    const result = await fetchTenants(params);
    return {
      module,
      query,
      path: "/tenants",
      total: result.meta.totalItems,
      items: result.items.map((tenant) => ({
        id: tenant.id,
        title: tenant.name,
        subtitle: [
          tenant.phone,
          tenant.email,
          tenant.properties.map((property) => property.name).join(", "),
        ]
          .filter(Boolean)
          .join(" · "),
      })),
    };
  }

  if (module === "leases") {
    const result = await fetchLeases(params);
    return {
      module,
      query,
      path: "/leases",
      total: result.meta.totalItems,
      items: result.items.map((lease) => ({
        id: lease.id,
        title: buildLeaseLabel(lease),
        subtitle: [
          lease.status,
          `${lease.startDate} → ${lease.endDate}`,
          formatRupees(lease.currentRent, locale),
          `due ${formatRupees(lease.outstandingBalance, locale)}`,
        ]
          .filter(Boolean)
          .join(" · "),
      })),
    };
  }

  const result = await fetchPayments(params);
  return {
    module,
    query,
    path: "/payments",
    total: result.meta.totalItems,
    items: result.items.map((payment) => ({
      id: payment.id,
      title: `${payment.tenantName} · ${payment.propertyName}`,
      subtitle: [
        formatRupees(payment.amountPaid, locale),
        payment.paymentDate,
        payment.paymentMethod,
      ].join(" · "),
    })),
  };
};

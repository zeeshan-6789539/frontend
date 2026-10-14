import { ASSISTANT_SEARCH_LIMIT } from "@/config/assistant";
import { fetchContacts } from "@/features/contacts/api/contacts.api";
import { fetchProperties } from "@/features/properties/api/properties.api";
import { fetchPropertyRequirements } from "@/features/property-requirements/api/property-requirements.api";
import { formatNumber } from "@/utils/format";
import type { IAssistantSearchResults, TAssistantSearchModule } from "@/types/voice-assistant";

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
        title: property.title,
        subtitle: [
          property.propertyTypeName,
          property.purpose,
          `PKR ${formatNumber(property.price, locale)}`,
          [property.areaName, property.city].filter(Boolean).join(", "),
          property.propertyStatus,
        ].join(" · "),
      })),
    };
  }

  if (module === "requirements") {
    const result = await fetchPropertyRequirements(params);
    return {
      module,
      query,
      path: "/requirements",
      total: result.meta.totalItems,
      items: result.items.map((requirement) => ({
        id: requirement.id,
        title: `${requirement.contactName} · ${requirement.contactPhone}`,
        subtitle: [
          requirement.purpose,
          requirement.propertyTypeName,
          requirement.preferredCity,
          requirement.budgetMax === null ? null : `≤ PKR ${formatNumber(requirement.budgetMax, locale)}`,
          requirement.requirementStatus,
        ]
          .filter(Boolean)
          .join(" · "),
      })),
    };
  }

  const result = await fetchContacts(params);
  return {
    module,
    query,
    path: "/contacts",
    total: result.meta.totalItems,
    items: result.items.map((contact) => ({
      id: contact.id,
      title: contact.name,
      subtitle: [contact.phone, contact.email].filter(Boolean).join(" · "),
    })),
  };
};

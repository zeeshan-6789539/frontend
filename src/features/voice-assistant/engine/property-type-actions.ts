import { ASSISTANT_OPTIONS_QUERY_KEY } from "@/config/assistant";
import { MAX_PAGE_SIZE } from "@/config/pagination";
import { propertyKeys } from "@/features/properties/api/property-keys";
import { propertyTypeKeys } from "@/features/property-types/api/property-type-keys";
import {
  deactivatePropertyType,
  fetchPropertyTypes,
  restorePropertyType,
  updatePropertyType,
} from "@/features/property-types/api/property-types.api";
import { getApiErrorMessage } from "@/utils/api";
import { matchOption } from "@/utils/fuzzy-match";
import type { QueryClient } from "@tanstack/react-query";
import type { IPropertyType } from "@/types/property-type";
import type { IAssistantToolResult } from "@/types/voice-assistant";

const FALLBACK_ERROR = "Something went wrong. Please try again.";

// Finds one type by its spoken name; a tool result (has "ok") explains why it could not
const findPropertyType = async (
  spokenName: string,
): Promise<IPropertyType | IAssistantToolResult> => {
  const { items } = await fetchPropertyTypes({ page: 1, limit: MAX_PAGE_SIZE, sortOrder: "asc" });
  const match = matchOption(
    items.map((item) => ({ value: item.id, label: item.name })),
    spokenName,
  );
  const propertyType = items.find((item) => item.id === match.option?.value);

  if (match.status === "matched" && propertyType) return propertyType;

  return match.status === "ambiguous"
    ? {
        ok: false,
        error: `More than one property type matches "${spokenName}". Ask the user which one.`,
        candidates: match.candidates.map((candidate) => candidate.label),
      }
    : {
        ok: false,
        error: `No property type matches "${spokenName}". Read the existing types to the user.`,
        candidates: items.map((item) => item.name),
      };
};

const refreshPropertyTypeQueries = (queryClient: QueryClient) =>
  [propertyTypeKeys.all, propertyKeys.all, ASSISTANT_OPTIONS_QUERY_KEY].forEach(
    (queryKey) => void queryClient.invalidateQueries({ queryKey }),
  );

export const renamePropertyType = async (
  queryClient: QueryClient,
  spokenName: string,
  newName: string,
): Promise<IAssistantToolResult> => {
  const trimmed = newName.trim();

  if (trimmed.length < 2 || trimmed.length > 100) {
    return { ok: false, error: "The new name must be between 2 and 100 characters." };
  }

  const found = await findPropertyType(spokenName);
  if ("ok" in found) return found;

  try {
    const saved = await updatePropertyType(found.id, { name: trimmed, status: found.status });
    refreshPropertyTypeQueries(queryClient);
    return { ok: true, renamedFrom: found.name, saved: saved.name };
  } catch (error) {
    return { ok: false, error: getApiErrorMessage(error, FALLBACK_ERROR) };
  }
};

export const setPropertyTypeStatus = async (
  queryClient: QueryClient,
  spokenName: string,
  isActive: boolean,
): Promise<IAssistantToolResult> => {
  const propertyType = await findPropertyType(spokenName);
  if ("ok" in propertyType) return propertyType;

  if (propertyType.status === isActive) {
    return { ok: true, saved: propertyType.name, note: `It was already ${isActive ? "active" : "deactivated"}.` };
  }

  try {
    const saved = isActive
      ? await restorePropertyType(propertyType.id)
      : await deactivatePropertyType(propertyType.id);
    refreshPropertyTypeQueries(queryClient);
    return { ok: true, saved: saved.name, status: saved.status ? "active" : "deactivated" };
  } catch (error) {
    return { ok: false, error: getApiErrorMessage(error, FALLBACK_ERROR) };
  }
};

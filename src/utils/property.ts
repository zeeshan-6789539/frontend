import type { IProperty } from "@/types/property";

// One label format for a property picked by voice, e.g. "P-0007 Sunset Apartments"
export const buildPropertyLabel = (property: Pick<IProperty, "propertyNumber" | "name">): string =>
  `${property.propertyNumber} ${property.name}`;

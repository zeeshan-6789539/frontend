import type { ReactNode } from "react";
import type { IProperty, TPropertyStatus } from "@/types/property";

export interface IPropertiesTableProps {
  properties: readonly IProperty[];
  onEdit: (property: IProperty) => void;
  onToggleStatus: (property: IProperty) => void;
  onChangeListingStatus: (property: IProperty, propertyStatus: TPropertyStatus) => void;
}

export interface IPropertyFormDialogProps {
  isOpen: boolean;
  property: IProperty | null;
  onClose: () => void;
}

export interface IPropertySummaryListProps {
  properties: readonly IProperty[];
  renderAction?: (property: IProperty) => ReactNode;
}

import type { IPropertyType } from "@/types/property-type";

export interface IPropertyTypesTableProps {
  propertyTypes: readonly IPropertyType[];
  onEdit: (propertyType: IPropertyType) => void;
  onToggleStatus: (propertyType: IPropertyType) => void;
}

export interface IPropertyTypeFormDialogProps {
  isOpen: boolean;
  propertyType: IPropertyType | null;
  onClose: () => void;
}

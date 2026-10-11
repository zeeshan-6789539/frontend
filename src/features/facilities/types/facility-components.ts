import type { IFacility } from "@/types/facility";

export interface IFacilitiesTableProps {
  facilities: readonly IFacility[];
  onEdit: (facility: IFacility) => void;
  onToggleStatus: (facility: IFacility) => void;
}

export interface IFacilityFormDialogProps {
  isOpen: boolean;
  facility: IFacility | null;
  onClose: () => void;
}

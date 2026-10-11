import type { TRequirementStatus } from "@/types/property";
import type { IPropertyRequirement } from "@/types/property-requirement";

export interface IPropertyRequirementsTableProps {
  requirements: readonly IPropertyRequirement[];
  onEdit: (requirement: IPropertyRequirement) => void;
  onToggleStatus: (requirement: IPropertyRequirement) => void;
  onShowMatches: (requirement: IPropertyRequirement) => void;
  onChangeProgress: (
    requirement: IPropertyRequirement,
    requirementStatus: TRequirementStatus,
  ) => void;
}

export interface IPropertyRequirementFormDialogProps {
  isOpen: boolean;
  requirement: IPropertyRequirement | null;
  onClose: () => void;
}

export interface IRequirementMatchesDialogProps {
  requirement: IPropertyRequirement | null;
  onClose: () => void;
}

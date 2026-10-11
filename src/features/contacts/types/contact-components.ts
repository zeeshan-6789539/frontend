import type { IContact } from "@/types/contact";

export interface IContactsTableProps {
  contacts: readonly IContact[];
  onEdit: (contact: IContact) => void;
  onToggleStatus: (contact: IContact) => void;
}

export interface IContactFormDialogProps {
  isOpen: boolean;
  contact: IContact | null;
  onClose: () => void;
}

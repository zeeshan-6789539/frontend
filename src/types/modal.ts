import type { ReactNode } from "react";

export type TModalSize = "md" | "lg";

export interface IModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  // Rendered under the title, e.g. a control that shapes the dialog's content
  headerContent?: ReactNode;
  size?: TModalSize;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export interface IConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isDestructive?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

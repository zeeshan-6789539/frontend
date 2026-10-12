import type {
  ButtonHTMLAttributes,
  ComponentPropsWithRef,
  HTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export type TButtonVariant =
  | "primary"
  | "secondary"
  | "soft"
  | "outline"
  | "ghost"
  | "danger";

export type TButtonSize = "sm" | "md" | "icon";

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariant;
  size?: TButtonSize;
  isLoading?: boolean;
}

export interface ICardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// ComponentPropsWithRef so callers can pass a ref straight through (React 19)
export interface IInputProps extends ComponentPropsWithRef<"input"> {
  hasError?: boolean;
  trailing?: ReactNode;
}

export interface ITextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export interface ISelectOption {
  value: string;
  label: string;
}

export interface IStepSliderProps {
  id?: string;
  options: readonly ISelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export interface ISelectProps {
  id?: string;
  options: readonly ISelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export interface IMultiSelectProps {
  id?: string;
  options: readonly ISelectOption[];
  values: readonly string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface IFormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export interface IFormGridProps {
  children: ReactNode;
}

export type TAlertVariant = "danger" | "info" | "success";

export interface IAlertProps {
  variant?: TAlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

export type TBadgeVariant = "success" | "danger" | "info" | "warning" | "muted";

export interface IBadgeProps {
  variant?: TBadgeVariant;
  children: ReactNode;
  className?: string;
}

export interface IEmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export interface ISearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  className?: string;
}

export interface IStatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
}

export interface IStackedBarSegment {
  key: string;
  label: string;
  value: number;
  // Tailwind fill-* class for the bar and bg-* class for the legend dot
  fillClassName: string;
  dotClassName: string;
}

export interface IStackedBarProps {
  segments: readonly IStackedBarSegment[];
  label: string;
  className?: string;
}

export interface IDatePickerProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  locale?: string;
  "aria-label"?: string;
}

export interface IDateTimePickerProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  locale?: string;
  "aria-label"?: string;
}

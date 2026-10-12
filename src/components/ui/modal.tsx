"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsHydrated } from "@/hooks/use-is-hydrated";
import { cn } from "@/utils/cn";
import type { IModalProps, TModalSize } from "@/types/modal";

const sizeClasses: Record<TModalSize, string> = {
  md: "max-w-md",
  lg: "max-w-4xl",
};

export const Modal = ({
  isOpen,
  title,
  description,
  headerContent,
  size = "md",
  onClose,
  children,
  footer,
}: IModalProps) => {
  const t = useTranslations("common");
  const isHydrated = useIsHydrated();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !isHydrated) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-overlay p-4 backdrop-blur-sm sm:items-center">
      <div
        onClick={onClose}
        aria-hidden
        className="absolute inset-0"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative my-auto w-full rounded-card border border-border bg-card shadow-lg",
          sizeClasses[size],
        )}
      >
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-start gap-4">
            <div className="min-w-0 space-y-1">
              <h2 id="modal-title" className="text-lg font-semibold tracking-tight">
                {title}
              </h2>
              {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label={t("close")}
              className="ms-auto shrink-0"
            >
              <X className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          {/* Full width, below the title row, so it can span under the close button */}
          {headerContent ? <div className="pt-2">{headerContent}</div> : null}
        </div>

        <div className="max-h-[70dvh] overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};

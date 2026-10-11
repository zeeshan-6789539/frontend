"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/utils/cn";
import type { IMultiSelectProps } from "@/types/ui";

// Opens inline below the field, so it never needs positioning or gets clipped inside a modal
export const MultiSelect = ({
  id,
  options,
  values,
  onChange,
  placeholder,
  hasError,
  disabled,
  className,
}: IMultiSelectProps) => {
  const t = useTranslations("select");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const generatedId = useId();
  const listboxId = `${id ?? generatedId}-listbox`;

  const selectedOptions = useMemo(
    () => options.filter((option) => values.includes(option.value)),
    [options, values],
  );

  const filteredOptions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return options;
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const close = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  const toggleValue = (value: string) => {
    onChange(
      values.includes(value)
        ? values.filter((current) => current !== value)
        : [...values, value],
    );
  };

  const toggleActive = () => {
    const option = filteredOptions[activeIndex];
    if (option) toggleValue(option.value);
  };

  useEffect(() => {
    if (!isOpen) return;

    searchInputRef.current?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
      setSearchQuery("");
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const activeItem = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    activeItem?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, filteredOptions.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        toggleActive();
        break;
      case "Escape":
        event.preventDefault();
        close();
        toggleRef.current?.focus();
        break;
      case "Backspace":
        if (!searchQuery && values.length > 0) onChange(values.slice(0, -1));
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn("space-y-1.5", className)}>
      <div
        className={cn(
          "flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-lg border bg-card px-2 py-1.5 text-sm shadow-sm transition-[border-color,box-shadow]",
          "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
          hasError ? "border-danger focus-within:border-danger focus-within:ring-danger/25" : "border-input",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {selectedOptions.map((option) => (
          <span
            key={option.value}
            className="inline-flex items-center gap-1 rounded-md bg-primary-soft py-0.5 ps-2 pe-1 text-xs font-medium text-primary-soft-foreground"
          >
            {option.label}
            <button
              type="button"
              disabled={disabled}
              onClick={() => toggleValue(option.value)}
              aria-label={t("removeItem", { label: option.label })}
              className="flex h-4 w-4 items-center justify-center rounded-sm transition-colors hover:bg-primary/15"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </span>
        ))}

        <button
          ref={toggleRef}
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          onClick={() => (isOpen ? close() : setIsOpen(true))}
          className="flex min-w-24 flex-1 items-center justify-between gap-2 px-1 py-1 text-start outline-none disabled:cursor-not-allowed"
        >
          <span className="truncate text-muted-foreground">
            {selectedOptions.length === 0 ? (placeholder ?? "") : t("addMore")}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </div>

      {isOpen ? (
        <div className="rounded-lg border border-input bg-popover shadow-md">
          <div className="border-b border-border p-1.5">
            <div className="relative flex items-center">
              <Search
                className="pointer-events-none absolute start-2.5 h-3.5 w-3.5 text-muted-foreground"
                aria-hidden
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={t("searchPlaceholder")}
                aria-controls={listboxId}
                aria-activedescendant={
                  filteredOptions[activeIndex] ? `${listboxId}-option-${activeIndex}` : undefined
                }
                className="h-8 w-full rounded-md border border-input bg-card ps-8 pe-2 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring/30"
              />
            </div>
          </div>

          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable
            className="max-h-56 overflow-auto p-1"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                {t("noResults")}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = values.includes(option.value);
                return (
                  <li
                    key={option.value}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => toggleValue(option.value)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors",
                      index === activeIndex && "bg-accent text-accent-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border-strong",
                      )}
                      aria-hidden
                    >
                      {isSelected ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

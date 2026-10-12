"use client";

import { useId } from "react";
import { cn } from "@/utils/cn";
import type { IStepSliderProps } from "@/types/ui";

export const StepSlider = ({
  id,
  options,
  value,
  onChange,
  disabled,
  className,
  ...props
}: IStepSliderProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  const selectIndex = (index: number) => {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
  };

  return (
    <div className={cn("space-y-1", className)}>
      <input
        id={inputId}
        type="range"
        min={0}
        max={Math.max(options.length - 1, 0)}
        step={1}
        value={selectedIndex}
        disabled={disabled}
        aria-valuetext={options[selectedIndex]?.label}
        onChange={(event) => selectIndex(Number(event.target.value))}
        className="h-2 w-full cursor-pointer rounded-full accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-60"
        {...props}
      />

      <div className="flex justify-between">
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => selectIndex(index)}
            className={cn(
              "rounded px-1 text-xs text-muted-foreground transition-colors hover:text-foreground",
              index === selectedIndex && "font-semibold text-primary",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

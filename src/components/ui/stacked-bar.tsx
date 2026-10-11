import { cn } from "@/utils/cn";
import { sumBy, toRatio } from "@/utils/number";
import type { IStackedBarProps } from "@/types/ui";

// SVG attributes carry the widths so no inline style is needed
export const StackedBar = ({ segments, label, className }: IStackedBarProps) => {
  const total = sumBy(segments, (segment) => segment.value);
  const visible = segments.filter((segment) => segment.value > 0);
  const offsets = visible.map((_, index) =>
    toRatio(sumBy(visible.slice(0, index), (segment) => segment.value), total),
  );

  return (
    <svg
      role="img"
      aria-label={label}
      width="100%"
      height="12"
      className={cn("block overflow-hidden rounded-full bg-muted", className)}
    >
      {visible.map((segment, index) => (
        <rect
          key={segment.key}
          x={`${offsets[index] * 100}%`}
          y="0"
          width={`${toRatio(segment.value, total) * 100}%`}
          height="12"
          strokeWidth="2"
          className={cn(
            "stroke-card transition-opacity duration-150 hover:opacity-80",
            segment.fillClassName,
          )}
        >
          <title>{`${segment.label}: ${segment.value}`}</title>
        </rect>
      ))}
    </svg>
  );
};

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "purple" | "gray";
type BadgeSize = "sm" | "md" | "lg";

const variantMap: Record<BadgeVariant, string> = {
  default: "bg-[var(--app-accent)] text-white",
  primary: "bg-[var(--app-accent)] text-white",
  success: "bg-[var(--app-success)] text-white",
  warning: "bg-[var(--app-warning)] text-white",
  danger: "bg-[var(--app-danger)] text-white",
  purple: "bg-mac-purple text-white",
  gray: "bg-mac-gray-200 dark:bg-mac-gray-700 text-[var(--app-text-primary)]",
};

const sizeMap: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-xs",
  lg: "px-2.5 py-1 text-sm",
};

interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
  count?: number;
  max?: number;
  style?: React.CSSProperties;
  color?: string;
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className,
  dot = false,
  count,
  max = 99,
  style,
  color,
}: BadgeProps) {
  if (dot && !children && typeof count === "undefined") {
    return (
      <span
        className={cn(
          "inline-flex rounded-full",
          size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2 h-2" : "w-2.5 h-2.5",
          variantMap[variant],
          className
        )}
        style={style}
      />
    );
  }

  const displayCount = typeof count === "number" ? (count > max ? `${max}+` : String(count)) : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium leading-none",
        variantMap[variant],
        sizeMap[size],
        className
      )}
      style={{
        ...style,
        ...(color && { backgroundColor: color }),
      }}
    >
      {dot && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          "bg-white/80"
        )} />
      )}
      {displayCount ?? children}
    </span>
  );
}

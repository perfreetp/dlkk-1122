import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "icon";
type ButtonSize = "xs" | "sm" | "md" | "lg";

const sizeMap: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-xs gap-1",
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2",
};

const iconSizeMap: Record<ButtonSize, string> = {
  xs: "w-6 h-6",
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-9 h-9",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  variant = "secondary",
  size = "md",
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isIcon = variant === "icon";

  const variantClasses = {
    primary:
      "text-white shadow-sm hover:shadow-md active:scale-[0.98]",
    secondary:
      "border hover:shadow-sm",
    ghost:
      "hover:bg-black/5 dark:hover:bg-white/5",
    danger:
      "text-white hover:opacity-90",
    icon:
      "rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]",
  }[variant];

  const bgStyle =
    variant === "primary"
      ? { background: "linear-gradient(180deg, var(--app-accent) 0%, var(--app-accent-hover) 100%)" }
      : variant === "secondary"
      ? { background: "var(--app-surface)", borderColor: "var(--app-border)", color: "var(--app-text-primary)" }
      : variant === "ghost"
      ? { color: "var(--app-text-secondary)" }
      : variant === "danger"
      ? { background: "var(--app-danger)" }
      : undefined;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--app-accent)]/40",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        isIcon ? iconSizeMap[size] : sizeMap[size],
        !isIcon && "mac-btn",
        variantClasses,
        fullWidth && "w-full",
        className
      )}
      style={bgStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {!isIcon && children}
      {!loading && rightIcon}
    </button>
  );
}

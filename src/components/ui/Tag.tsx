import { cn, getContrastColor } from "@/lib/utils";
import { X } from "lucide-react";

type TagVariant = "solid" | "outline" | "soft";
type TagSize = "sm" | "md";

const sizeMap: Record<TagSize, { container: string; icon: string }> = {
  sm: { container: "px-2 py-0.5 text-xs gap-1", icon: "w-3 h-3 -mr-1" },
  md: { container: "px-2.5 py-1 text-xs gap-1.5", icon: "w-3.5 h-3.5 -mr-1" },
};

interface TagProps {
  children?: React.ReactNode;
  color?: string;
  variant?: TagVariant;
  size?: TagSize;
  className?: string;
  closable?: boolean;
  onClose?: () => void;
  onClick?: (e?: React.MouseEvent) => void;
}

export default function Tag({
  children,
  color = "#007AFF",
  variant = "soft",
  size = "md",
  className,
  closable = false,
  onClose,
  onClick,
}: TagProps) {
  const base = sizeMap[size];

  const getStyles = () => {
    if (variant === "solid") {
      return {
        backgroundColor: color,
        color: getContrastColor(color),
      };
    }
    if (variant === "outline") {
      return {
        backgroundColor: "transparent",
        borderColor: color,
        color: color,
        borderWidth: 1,
        borderStyle: "solid" as const,
      };
    }
    return {
      backgroundColor: `${color}18`,
      color: color,
    };
  };

  return (
    <span
      className={cn(
        "mac-tag transition-all duration-150",
        base.container,
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
      style={getStyles()}
      onClick={onClick}
    >
      {children}
      {closable && (
        <button
          type="button"
          className={cn("rounded-full p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/15", base.icon)}
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        >
          <X className="w-full h-full" />
        </button>
      )}
    </span>
  );
}

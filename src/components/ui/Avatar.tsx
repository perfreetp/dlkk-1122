import { cn, getInitials } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const sizeMap: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  "2xl": "w-24 h-24 text-2xl",
};

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
  ring?: boolean;
  online?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  title?: string;
  style?: React.CSSProperties;
}

const colorPalette = [
  "#007AFF", "#5856D6", "#AF52DE", "#FF2D55",
  "#FF3B30", "#FF9500", "#FFCC00", "#34C759",
  "#30B0C7", "#00C7BE",
];

function pickColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
}

export default function Avatar({
  src,
  alt = "",
  name = "",
  size = "md",
  className,
  ring = false,
  online,
  onClick,
  title,
  style,
}: AvatarProps) {
  const initials = getInitials(name || alt);
  const bgColor = name ? pickColor(name) : "#8E8E93";

  return (
    <div
      className={cn("relative inline-flex", onClick && "cursor-pointer", className)}
      style={style}
      onClick={onClick}
      title={title}
    >
      <div
        className={cn(
          "mac-avatar flex items-center justify-center font-semibold select-none",
          sizeMap[size],
          ring && "ring-2 ring-offset-1",
          ring && "ring-[var(--app-border)] ring-offset-[var(--app-surface)]"
        )}
        style={!src ? { backgroundColor: bgColor, color: "#fff" } : undefined}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {typeof online === "boolean" && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-[var(--app-surface)]",
            size === "xs" ? "w-1.5 h-1.5" :
            size === "sm" ? "w-2 h-2" :
            size === "md" ? "w-2.5 h-2.5" :
            "w-3 h-3",
            online ? "bg-mac-green" : "bg-mac-gray-400"
          )}
        />
      )}
    </div>
  );
}

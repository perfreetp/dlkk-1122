import { cn } from "@/lib/utils";

type SkeletonVariant = "text" | "circular" | "rectangular" | "card" | "list";

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

export default function Skeleton({
  variant = "text",
  width,
  height,
  count = 1,
  className,
}: SkeletonProps) {
  const getStyles = (): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (width !== undefined) style.width = typeof width === "number" ? `${width}px` : width;
    if (height !== undefined) style.height = typeof height === "number" ? `${height}px` : height;
    return style;
  };

  if (variant === "card") {
    return (
      <div
        className={cn(
          "rounded-xl p-5 animate-pulse",
          className
        )}
        style={{
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
        }}
      >
        <div className="flex gap-4 mb-4">
          <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/5 rounded" />
            <div className="skeleton h-3 w-1/4 rounded" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg animate-pulse"
            style={{ background: "var(--app-surface)" }}
          >
            <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => {
        const baseClass = "skeleton";
        const shapeClass =
          variant === "circular"
            ? "rounded-full"
            : variant === "rectangular"
            ? "rounded-lg"
            : "rounded";
        const defaultSize =
          variant === "circular"
            ? "w-10 h-10"
            : variant === "rectangular"
            ? "w-full h-32"
            : "w-full h-4";

        return (
          <div
            key={i}
            className={cn(baseClass, shapeClass, defaultSize, count > 1 && i > 0 && "mt-2", className)}
            style={getStyles()}
          />
        );
      })}
    </>
  );
}

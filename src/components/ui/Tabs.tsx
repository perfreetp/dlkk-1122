import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";

export interface TabItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  variant?: "default" | "pills" | "segmented" | "underline";
  size?: "sm" | "md";
  className?: string;
  tabClassName?: string;
  contentClassName?: string;
  mountOnEnter?: boolean;
}

export default function Tabs({
  items,
  defaultActiveKey,
  activeKey: controlledKey,
  onChange,
  variant = "default",
  size = "md",
  className,
  tabClassName,
  contentClassName,
  mountOnEnter = false,
}: TabsProps) {
  const [uncontrolledKey, setUncontrolledKey] = useState(defaultActiveKey ?? items[0]?.key);
  const isControlled = controlledKey !== undefined;
  const activeKey = isControlled ? controlledKey : uncontrolledKey;

  const setActive = (key: string) => {
    if (!isControlled) setUncontrolledKey(key);
    onChange?.(key);
  };

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
  };

  const getVariantStyles = (active: boolean) => {
    if (variant === "pills") {
      return {
        container: "gap-1",
        tab: cn(
          "rounded-lg transition-all duration-200 font-medium",
          active
            ? "shadow-sm"
            : "hover:bg-black/5 dark:hover:bg-white/5"
        ),
        activeBg: active ? "var(--app-accent)" : "transparent",
        activeColor: active ? "#fff" : "var(--app-text-secondary)",
      };
    }
    if (variant === "segmented") {
      return {
        container: "gap-0 p-0.5 rounded-lg",
        tab: cn(
          "rounded-md transition-all duration-200 font-medium",
          active ? "shadow-sm" : ""
        ),
        containerBg: "var(--app-surface-secondary)",
        activeBg: active ? "var(--app-surface)" : "transparent",
        activeColor: active ? "var(--app-text-primary)" : "var(--app-text-secondary)",
      };
    }
    if (variant === "underline") {
      return {
        container: "gap-0 border-b",
        containerBorderColor: "var(--app-border)",
        tab: cn(
          "rounded-none border-b-2 -mb-px transition-all duration-200 font-medium",
          active ? "" : "border-transparent hover:text-[var(--app-text-primary)]"
        ),
        activeBorderColor: active ? "var(--app-accent)" : "transparent",
        activeColor: active ? "var(--app-accent)" : "var(--app-text-secondary)",
      };
    }
    return {
      container: "gap-1",
      tab: cn(
        "rounded-lg transition-all duration-200",
        active
          ? "bg-[var(--app-surface)] shadow-sm font-semibold"
          : "hover:bg-black/5 dark:hover:bg-white/5 font-medium"
      ),
      activeColor: active ? "var(--app-text-primary)" : "var(--app-text-secondary)",
    };
  };

  const variantStyles = getVariantStyles(true);
  const containerStyle: React.CSSProperties = {};
  if ((variantStyles as any).containerBg) containerStyle.background = (variantStyles as any).containerBg;
  if ((variantStyles as any).containerBorderColor) containerStyle.borderColor = (variantStyles as any).containerBorderColor;

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn("flex items-center flex-wrap", variantStyles.container)}
        role="tablist"
        style={containerStyle}
      >
        {items.map((item) => {
          const active = item.key === activeKey;
          const styles = getVariantStyles(active);
          const tabStyle: React.CSSProperties = { color: styles.activeColor };
          if ((styles as any).activeBg) tabStyle.background = (styles as any).activeBg;
          if ((styles as any).activeBorderColor) tabStyle.borderBottomColor = (styles as any).activeBorderColor;

          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={item.disabled}
              className={cn(
                "inline-flex items-center justify-center outline-none",
                "focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/40 focus-visible:ring-offset-1",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                sizeStyles[size],
                styles.tab,
                tabClassName
              )}
              style={tabStyle}
              onClick={() => !item.disabled && setActive(item.key)}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className={cn("mt-4", contentClassName)}>
        {items.map((item) => {
          const active = item.key === activeKey;
          if (mountOnEnter && !active) return null;
          return (
            <div
              key={item.key}
              role="tabpanel"
              hidden={!active}
              className={cn(!active && "hidden")}
            >
              {item.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type DropdownPlacement = "bottom-left" | "bottom-right" | "bottom-center" | "top-right" | "top-left";

export interface DropdownItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: DropdownPlacement;
  className?: string;
  menuClassName?: string;
  alignWidth?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const placementMap: Record<DropdownPlacement, string> = {
  "bottom-left": "left-0",
  "bottom-right": "right-0",
  "bottom-center": "left-1/2 -translate-x-1/2",
  "top-right": "right-0 bottom-full mb-1.5",
  "top-left": "left-0 bottom-full mb-1.5",
};

export default function Dropdown({
  trigger,
  items,
  placement = "bottom-left",
  className,
  menuClassName,
  alignWidth = false,
  open: controlledOpen,
  onOpenChange,
}: DropdownProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setUncontrolledOpen(v);
    onOpenChange?.(v);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const triggerWidth = alignWidth ? triggerRef.current?.offsetWidth : undefined;

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <div
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="cursor-pointer"
      >
        {trigger}
      </div>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-full mt-1.5 z-50 min-w-[160px] py-1 rounded-xl shadow-mac-lg animate-fade-in-up overflow-hidden",
            placementMap[placement],
            menuClassName
          )}
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
            width: triggerWidth ? `${triggerWidth}px` : undefined,
          }}
        >
          {items.map((item, idx) => {
            if (item.divider) {
              return (
                <div
                  key={`divider-${idx}`}
                  className="my-1"
                  style={{ borderTop: "1px solid var(--app-border)" }}
                />
              );
            }
            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left",
                  "hover:bg-[var(--app-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed",
                  item.danger && "text-[var(--app-danger)] hover:bg-[var(--app-danger)]/10"
                )}
                style={!item.danger ? { color: "var(--app-text-primary)" } : undefined}
                onClick={() => {
                  if (item.disabled) return;
                  item.onClick?.();
                  setOpen(false);
                }}
              >
                {item.icon && <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <span
                    className="text-xs ml-4"
                    style={{ color: "var(--app-text-tertiary)" }}
                  >
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { ChevronDown };

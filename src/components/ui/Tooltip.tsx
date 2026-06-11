import { useState, useRef, useId, useEffect } from "react";
import { cn } from "@/lib/utils";

type TooltipPlacement = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  className?: string;
  disabled?: boolean;
}

const placementStyles: Record<TooltipPlacement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export default function Tooltip({
  content,
  children,
  placement = "top",
  delay = 200,
  className,
  disabled = false,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (visible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ x: rect.left, y: rect.top });
    } else {
      setCoords(null);
    }
  }, [visible]);

  const show = () => {
    if (disabled) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setVisible(false), 80);
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          id={id}
          className={cn(
            "pointer-events-none absolute z-50 animate-fade-in-up",
            placementStyles[placement],
            "px-2 py-1 rounded-md text-xs whitespace-nowrap shadow-mac",
            className
          )}
          style={{
            background: "var(--app-text-primary)",
            color: "var(--app-surface)",
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

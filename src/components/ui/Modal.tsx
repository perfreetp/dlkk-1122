import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Button from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  closeOnOverlayClick?: boolean;
  showClose?: boolean;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className,
  closeOnOverlayClick = true,
  showClose = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs animate-fade-in-up"
        onClick={() => closeOnOverlayClick && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full rounded-2xl shadow-mac-lg animate-fade-in-up overflow-hidden",
          sizeMap[size],
          className
        )}
        style={{
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
        }}
      >
        {(title || showClose) && (
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--app-border)" }}
          >
            <h3 className="text-base font-semibold" style={{ color: "var(--app-text-primary)" }}>
              {title}
            </h3>
            {showClose && (
              <Button variant="icon" size="sm" onClick={onClose} aria-label="关闭">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
        <div className="px-5 py-4 text-sm" style={{ color: "var(--app-text-primary)" }}>
          {children}
        </div>
        {footer && (
          <div
            className="flex items-center justify-end gap-2 px-5 py-4"
            style={{ borderTop: "1px solid var(--app-border)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

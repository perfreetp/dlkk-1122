import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore, type ToastType, type ToastItem } from "@/stores/toastStore";

const typeConfig: Record<ToastType, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  success: {
    icon: CheckCircle2,
    color: "var(--app-success)",
    bg: "rgba(52, 199, 89, 0.12)",
  },
  error: {
    icon: XCircle,
    color: "var(--app-danger)",
    bg: "rgba(255, 59, 48, 0.12)",
  },
  warning: {
    icon: AlertTriangle,
    color: "var(--app-warning)",
    bg: "rgba(255, 149, 0, 0.12)",
  },
  info: {
    icon: Info,
    color: "var(--app-accent)",
    bg: "color-mix(in srgb, var(--app-accent) 12%, transparent)",
  },
};

function ToastSingle({ toast }: { toast: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 min-w-[300px] max-w-[420px]",
        "px-4 py-3 rounded-xl shadow-mac-lg animate-slide-in-right overflow-hidden"
      )}
      style={{
        background: "var(--app-surface)",
        border: "1px solid var(--app-border)",
      }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: config.bg }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: config.color }} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div
            className="text-sm font-semibold mb-0.5"
            style={{ color: "var(--app-text-primary)" }}
          >
            {toast.title}
          </div>
        )}
        <div
          className="text-sm leading-relaxed"
          style={{ color: "var(--app-text-secondary)" }}
        >
          {toast.message}
        </div>
      </div>
      <button
        type="button"
        aria-label="关闭提示"
        className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        onClick={() => dismiss(toast.id)}
        style={{ color: "var(--app-text-tertiary)" }}
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div
        className="absolute bottom-0 left-0 h-0.5 animate-[shimmer_2s_linear_infinite]"
        style={{
          width: "100%",
          background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
          opacity: 0.5,
        }}
      />
    </div>
  );
}

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastSingle toast={toast} />
        </div>
      ))}
    </div>
  );
}

export { Toast };

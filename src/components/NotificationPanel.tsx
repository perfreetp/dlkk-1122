import { useMemo, useEffect, useState } from "react";
import { cn, formatTime } from "@/lib/utils";
import { useAppStore } from "@/stores/appStore";
import type { NotificationType, Notification } from "@/types";
import {
  X,
  MessageSquare,
  AtSign,
  Heart,
  Bell,
  Mail,
  CheckCheck,
  Settings,
} from "lucide-react";
import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import Empty from "./ui/Empty";
import Button from "./ui/Button";

const typeConfig: Record<NotificationType, { icon: typeof Bell; label: string; color: string; bg: string }> = {
  reply: {
    icon: MessageSquare,
    label: "回复",
    color: "var(--app-accent)",
    bg: "color-mix(in srgb, var(--app-accent) 12%, transparent)",
  },
  mention: {
    icon: AtSign,
    label: "提及",
    color: "#AF52DE",
    bg: "rgba(175, 82, 222, 0.12)",
  },
  like: {
    icon: Heart,
    label: "点赞",
    color: "var(--app-danger)",
    bg: "color-mix(in srgb, var(--app-danger) 12%, transparent)",
  },
  system: {
    icon: Bell,
    label: "系统",
    color: "var(--app-warning)",
    bg: "color-mix(in srgb, var(--app-warning) 12%, transparent)",
  },
  message: {
    icon: Mail,
    label: "私信",
    color: "var(--app-success)",
    bg: "color-mix(in srgb, var(--app-success) 12%, transparent)",
  },
};

const typeFilters: Array<{ key: "all" | NotificationType; label: string }> = [
  { key: "all", label: "全部" },
  { key: "reply", label: "回复" },
  { key: "mention", label: "提及" },
  { key: "like", label: "点赞" },
  { key: "system", label: "系统" },
  { key: "message", label: "私信" },
];

function useLocalState<T>(key: string, initial: T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initial;
    } catch {
      return initial;
    }
  });
  const setValue = (v: T) => {
    setState(v);
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  };
  return [state, setValue];
}

export default function NotificationPanel() {
  const show = useAppStore((s) => s.showNotificationPanel);
  const toggleShow = useAppStore((s) => s.toggleShowNotificationPanel);
  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);
  const setActivePost = useAppStore((s) => s.setActivePost);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const setActiveSettingsTab = useAppStore((s) => s.setActiveSettingsTab);

  const [filter, setFilter] = useLocalState<"all" | NotificationType>("notification-filter", "all");

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    let list = notifications;
    if (filter !== "all") {
      list = list.filter((n) => n.type === filter);
    }
    return [...list].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notifications, filter]);

  const grouped = useMemo(() => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const earlier: Notification[] = [];
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    filtered.forEach((n) => {
      const d = new Date(n.createdAt).toDateString();
      if (d === todayStr) today.push(n);
      else if (d === yesterdayStr) yesterday.push(n);
      else earlier.push(n);
    });
    return { today, yesterday, earlier };
  }, [filtered]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleShow();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show, toggleShow]);

  if (!show) return null;

  const handleClick = (n: Notification) => {
    if (!n.read) markRead(n.id);
    if (n.targetId) {
      setActivePost(n.targetId);
      toggleShow();
    }
  };

  const renderGroup = (items: Notification[], title: string) => {
    if (items.length === 0) return null;
    return (
      <div key={title} className="mb-4">
        <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--app-text-tertiary)" }}>
          {title} · {items.length}
        </div>
        <div className="space-y-0.5">
          {items.map((n) => {
            const cfg = typeConfig[n.type];
            const Icon = cfg.icon;
            return (
              <button
                key={n.id}
                type="button"
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                  "hover:bg-[var(--app-surface-hover)]"
                )}
                style={{
                  background: !n.read ? "color-mix(in srgb, var(--app-accent) 5%, transparent)" : "transparent",
                }}
                onClick={() => handleClick(n)}
              >
                <div className="relative flex-shrink-0">
                  <Avatar src={n.fromUser?.avatar} name={n.fromUser?.nickname || "系统"} size="md" />
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2"
                    style={{
                      background: cfg.bg,
                      borderColor: "var(--app-surface)",
                    }}
                  >
                    <Icon className="w-2.5 h-2.5" style={{ color: cfg.color }} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium" style={{ color: "var(--app-text-primary)" }}>
                        {n.fromUser?.nickname || "系统通知"}
                      </span>
                      <Badge variant="gray" size="sm" className="ml-2">
                        {cfg.label}
                      </Badge>
                      {!n.read && (
                        <span className="ml-2 inline-block w-2 h-2 rounded-full" style={{ background: "var(--app-accent)" }} />
                      )}
                    </div>
                    <span className="flex-shrink-0 text-xs whitespace-nowrap" style={{ color: "var(--app-text-tertiary)" }}>
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-sm font-medium" style={{ color: "var(--app-text-primary)" }}>
                    {n.title}
                  </div>
                  <p className="mt-1 text-xs line-clamp-2" style={{ color: "var(--app-text-secondary)" }}>
                    {n.content}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xs" onClick={toggleShow} />
      <div
        className={cn(
          "absolute top-0 right-0 h-full w-[400px] max-w-[92vw]",
          "shadow-mac-lg animate-slide-in-right flex flex-col overflow-hidden"
        )}
        style={{
          background: "var(--app-surface)",
          borderLeft: "1px solid var(--app-border)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--app-border)" }}>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold" style={{ color: "var(--app-text-primary)" }}>
              通知中心
            </h2>
            {unreadCount > 0 && (
              <Badge variant="primary" size="sm">
                {unreadCount} 未读
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="icon"
              size="sm"
              onClick={() => {
                setActivePanel("settings");
                setActiveSettingsTab("notifications");
                toggleShow();
              }}
              aria-label="通知设置"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="icon" size="sm" onClick={toggleShow} aria-label="关闭">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1 px-4 py-2.5 overflow-x-auto" style={{ borderBottom: "1px solid var(--app-border)" }}>
          {typeFilters.map((f) => {
            const active = filter === f.key;
            const count =
              f.key === "all"
                ? unreadCount
                : notifications.filter((n) => n.type === f.key && !n.read).length;
            return (
              <button
                key={f.key}
                type="button"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  active ? "" : "hover:bg-black/5 dark:hover:bg-white/5"
                )}
                style={{
                  background: active ? "var(--app-accent)" : "transparent",
                  color: active ? "#fff" : "var(--app-text-secondary)",
                }}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                      active ? "bg-white/25" : "bg-black/5 dark:bg-white/10"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <Empty
              type="default"
              title="暂无通知"
              description={filter !== "all" ? `没有「${typeFilters.find((f) => f.key === filter)?.label}」类型的通知` : "当有人回复、点赞或提及时，这里会显示通知"}
            />
          ) : (
            <>
              {renderGroup(grouped.today, "今天")}
              {renderGroup(grouped.yesterday, "昨天")}
              {renderGroup(grouped.earlier, "更早")}
            </>
          )}
        </div>

        {unreadCount > 0 && (
          <div className="px-4 py-3" style={{ borderTop: "1px solid var(--app-border)" }}>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              leftIcon={<CheckCheck className="w-4 h-4" />}
              onClick={markAllRead}
            >
              全部标记为已读
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useCallback, useRef, useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { CATEGORIES, NOTIFICATIONS, CONVERSATIONS } from "@/mock";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

type PanelType = "feed" | "categories" | "messages" | "favorites" | "drafts" | "profile";

interface NavItem {
  key: PanelType;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { key: "feed", label: "推荐", icon: LucideIcons.Flame },
  { key: "categories", label: "分区", icon: LucideIcons.Layers },
  { key: "favorites", label: "收藏", icon: LucideIcons.Heart },
  { key: "drafts", label: "草稿箱", icon: LucideIcons.FileEdit },
  { key: "messages", label: "消息", icon: LucideIcons.MessageSquare },
  { key: "profile", label: "个人", icon: LucideIcons.User },
];

function getIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[name] || LucideIcons.Folder;
}

function CategoryTreeItem({
  category,
  depth = 0,
  activeId,
  onSelect,
  expandedIds,
  toggleExpand,
}: {
  category: Category;
  depth?: number;
  activeId?: string;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);
  const isActive = activeId === category.id;
  const Icon = getIcon(category.icon);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (hasChildren && !isActive) {
            toggleExpand(category.id);
          }
          onSelect(category.id);
        }}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150",
          isActive
            ? "font-medium shadow-sm"
            : "hover:bg-black/5 dark:hover:bg-white/5"
        )}
        style={{
          paddingLeft: `${12 + depth * 14}px`,
          background: isActive ? "var(--app-accent)" : "transparent",
          color: isActive ? "#fff" : "var(--app-text-secondary)",
        }}
      >
        {hasChildren ? (
          <LucideIcons.ChevronRight
            className={cn(
              "w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200",
              isExpanded ? "rotate-90" : ""
            )}
            style={{
              color: isActive ? "rgba(255,255,255,0.8)" : "var(--app-text-tertiary)",
            }}
          />
        ) : (
          <span className="w-3.5 h-3.5 flex-shrink-0" />
        )}
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left truncate">{category.name}</span>
        {category.unreadCount && category.unreadCount > 0 && !isActive && (
          <Badge variant="danger" size="sm" count={category.unreadCount} />
        )}
        {isActive && category.unreadCount && category.unreadCount > 0 && (
          <span className="text-[10px] font-semibold opacity-80">
            {category.unreadCount}
          </span>
        )}
      </button>

      {hasChildren && isExpanded && (
        <div className="mt-0.5">
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              depth={depth + 1}
              activeId={activeId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const {
    currentUser,
    preferences,
    setSidebarWidth,
    activePanel,
    setActivePanel,
    setActiveCategory,
    activeCategoryId,
    setActiveSettingsTab,
    drafts,
  } = useAppStore();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(CATEGORIES.filter((c) => c.children && c.children.length > 0).map((c) => c.id))
  );

  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const unreadMsg = CONVERSATIONS.reduce((acc, c) => acc + c.unreadCount, 0);
  const unreadNotif = NOTIFICATIONS.filter((n) => !n.read).length;

  const getUnread = (key: PanelType): number => {
    switch (key) {
      case "messages":
        return unreadMsg;
      case "favorites":
        return 0;
      case "drafts":
        return drafts.length;
      default:
        return unreadNotif;
    }
  };

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleNavClick = (key: PanelType) => {
    setActivePanel(key);
    if (key !== "categories") {
      setActiveCategory(undefined);
    }
  };

  const handleCategorySelect = (id: string) => {
    setActiveCategory(id);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = preferences.sidebarWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      const newWidth = Math.max(180, Math.min(320, startWidth.current + delta));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setSidebarWidth]);

  return (
    <aside
      className="h-full flex-shrink-0 flex flex-col relative vibrant-light border-r app-transition"
      style={{
        width: `${preferences.sidebarWidth}px`,
        borderRightColor: "var(--app-border)",
      }}
    >
      <div className="flex-shrink-0 px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, var(--app-accent) 0%, var(--app-accent-hover) 100%)",
            }}
          >
            <LucideIcons.Apple className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="text-sm font-bold truncate"
              style={{ color: "var(--app-text-primary)" }}
            >
              Mac 社区
            </h1>
            <p
              className="text-[11px] truncate"
              style={{ color: "var(--app-text-tertiary)" }}
            >
              果粉的聚集地
            </p>
          </div>
        </div>
      </div>

      <div className="mac-divider mx-4 my-0" />

      <div className="flex-shrink-0 px-3 py-3">
        <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-text-tertiary)" }}>
          导航
        </div>
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePanel === item.key;
            const unread = getUnread(item.key);

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavClick(item.key)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                  isActive
                    ? "font-medium shadow-sm"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                )}
                style={{
                  background: isActive ? "var(--app-accent)" : "transparent",
                  color: isActive ? "#fff" : "var(--app-text-secondary)",
                }}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {unread > 0 && !isActive && (
                  <Badge variant="danger" size="sm" count={unread} />
                )}
                {unread > 0 && isActive && (
                  <span className="text-[10px] font-semibold opacity-80">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mac-divider mx-4 my-0" />

      <div className="flex-1 min-h-0 flex flex-col px-3 py-3 overflow-hidden">
        <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between" style={{ color: "var(--app-text-tertiary)" }}>
          <span>分区</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 -mr-1">
          {CATEGORIES.map((cat) => (
            <CategoryTreeItem
              key={cat.id}
              category={cat}
              activeId={activeCategoryId}
              onSelect={handleCategorySelect}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 mx-3 mb-3 mt-2">
        <div
          className="rounded-xl p-3 transition-all hover:shadow-sm cursor-pointer group"
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
          }}
          onClick={() => setActivePanel("profile")}
        >
          <div className="flex items-center gap-2.5">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.nickname}
              size="md"
              ring
              online={currentUser.isOnline}
            />
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-semibold truncate"
                style={{ color: "var(--app-text-primary)" }}
              >
                {currentUser.nickname}
              </div>
              <div
                className="text-[11px] truncate"
                style={{ color: "var(--app-text-tertiary)" }}
              >
                {currentUser.signature || `Lv.${currentUser.level}`}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSettingsTab("general");
                setActivePanel("settings");
              }}
              className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
                "hover:bg-black/5 dark:hover:bg-white/5",
                "text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]"
              )}
              title="偏好设置"
            >
              <LucideIcons.Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize z-10 opacity-0 hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeStart}
      >
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-full"
          style={{ background: "var(--app-accent)", opacity: 0.3 }}
        />
      </div>
    </aside>
  );
}

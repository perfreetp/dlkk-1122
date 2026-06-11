import { useAppStore } from "@/stores/appStore";
import Breadcrumb from "./Breadcrumb";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Dropdown, { type DropdownItem } from "@/components/ui/Dropdown";
import {
  Search,
  Bell,
  PenSquare,
  User,
  FileText,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TitleBar() {
  const {
    currentUser,
    showNotificationPanel,
    drafts,
    notifications,
    toggleShowSearch,
    toggleShowNotificationPanel,
    setShowEditor,
    toggleShowUserMenu,
    showUserMenu,
    setActivePanel,
    setActiveSettingsTab,
  } = useAppStore();

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const userMenuItems: DropdownItem[] = [
    {
      key: "profile",
      label: "个人主页",
      icon: <User className="w-4 h-4" />,
      onClick: () => setActivePanel("profile"),
    },
    {
      key: "drafts",
      label: (
        <span className="flex items-center justify-between gap-4">
          <span>我的草稿</span>
          {drafts.length > 0 && (
            <Badge variant="gray" size="sm" count={drafts.length} />
          )}
        </span>
      ),
      icon: <FileText className="w-4 h-4" />,
      onClick: () => setShowEditor(true, drafts[0]?.id),
    },
    {
      key: "switch",
      label: "切换帐号",
      icon: <Users className="w-4 h-4" />,
    },
    {
      key: "settings",
      label: "偏好设置",
      icon: <Settings className="w-4 h-4" />,
      shortcut: "⌘,",
      onClick: () => {
        setActiveSettingsTab("general");
        setActivePanel("settings");
      },
    },
    { key: "divider1", label: "", divider: true },
    {
      key: "logout",
      label: "退出登录",
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
    },
  ];

  return (
    <header
      className="h-12 flex-shrink-0 flex items-center px-4 vibrant-toolbar border-b relative z-30"
      style={{ borderBottomColor: "var(--app-border)" }}
    >
      <div className="flex items-center gap-2 w-48">
        <div className="traffic-lights">
          <span
            className="traffic-light traffic-close group cursor-pointer"
            title="关闭"
          />
          <span
            className="traffic-light traffic-min group cursor-pointer"
            title="最小化"
          />
          <span
            className="traffic-light traffic-max group cursor-pointer"
            title="最大化"
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center min-w-0 px-4">
        <div className="w-full max-w-2xl min-w-0 overflow-hidden">
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-1 w-48 justify-end">
        <button
          type="button"
          onClick={toggleShowSearch}
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center transition-all",
            "hover:bg-black/5 dark:hover:bg-white/5",
            "text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]"
          )}
          title="搜索 (⌘K)"
        >
          <Search className="w-4.5 h-4.5" />
        </button>

        <button
          type="button"
          onClick={toggleShowNotificationPanel}
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center relative transition-all",
            "hover:bg-black/5 dark:hover:bg-white/5",
            showNotificationPanel
              ? "bg-black/10 dark:bg-white/10"
              : "",
            "text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]"
          )}
          title="通知"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotifCount > 0 && (
            <>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--app-danger)] animate-pulse-ring" />
              <span className="absolute -top-0.5 -right-0.5 mac-badge scale-75">
                {unreadNotifCount > 99 ? "99+" : unreadNotifCount}
              </span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowEditor(true)}
          className={cn(
            "h-8 px-3 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all",
            "text-white shadow-sm hover:shadow-md active:scale-[0.98]"
          )}
          style={{
            background:
              "linear-gradient(180deg, var(--app-accent) 0%, var(--app-accent-hover) 100%)",
          }}
          title="发帖 (⌘N)"
        >
          <PenSquare className="w-4 h-4" />
          <span className="hidden sm:inline">发帖</span>
        </button>

        <Dropdown
          trigger={
            <div className="ml-1">
              <Avatar
                src={currentUser.avatar}
                name={currentUser.nickname}
                size="sm"
                ring
                className="cursor-pointer"
              />
            </div>
          }
          items={[
            {
              key: "user-info",
              label: (
                <div className="flex items-center gap-3 py-0.5">
                  <Avatar
                    src={currentUser.avatar}
                    name={currentUser.nickname}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--app-text-primary)" }}
                    >
                      {currentUser.nickname}
                    </div>
                    <div
                      className="text-xs truncate"
                      style={{ color: "var(--app-text-secondary)" }}
                    >
                      {currentUser.signature || `@${currentUser.username}`}
                    </div>
                  </div>
                </div>
              ),
              disabled: true,
            },
            { key: "divider0", label: "", divider: true },
            ...userMenuItems,
          ]}
          placement="bottom-right"
          open={showUserMenu}
          onOpenChange={(open) => {
            if (open !== showUserMenu) toggleShowUserMenu();
          }}
          menuClassName="min-w-[220px]"
        />
      </div>
    </header>
  );
}

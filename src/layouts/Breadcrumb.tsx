import { useAppStore } from "@/stores/appStore";
import { CATEGORIES, POSTS, FAVORITE_GROUPS, USERS } from "@/mock";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface CrumbItem {
  label: string;
  onClick?: () => void;
}

export default function Breadcrumb() {
  const {
    activePanel,
    activePostId,
    activeCategoryId,
    activeFavoriteGroupId,
    profileUserId,
    setActivePanel,
    setActiveCategory,
    setActivePost,
    setProfileUserId,
    setActiveFavoriteGroup,
  } = useAppStore();

  const activePost = POSTS.find((p) => p.id === activePostId);
  const activeCategory = CATEGORIES.find((c) => c.id === activeCategoryId) ||
    CATEGORIES.flatMap((c) => c.children || []).find((c) => c.id === activeCategoryId);
  const activeGroup = FAVORITE_GROUPS.find((g) => g.id === activeFavoriteGroupId);
  const profileUser = USERS.find((u) => u.id === profileUserId);

  const getCrumbs = (): CrumbItem[] => {
    const crumbs: CrumbItem[] = [];

    switch (activePanel) {
      case "feed":
        crumbs.push({ label: "推荐信息流" });
        break;

      case "categories":
        crumbs.push({
          label: "分区列表",
          onClick: () => setActiveCategory(undefined),
        });
        if (activeCategory) {
          crumbs.push({ label: activeCategory.name });
        }
        break;

      case "post":
        crumbs.push({
          label: "推荐信息流",
          onClick: () => setActivePanel("feed"),
        });
        if (activePost) {
          crumbs.push({
            label: activePost.category.name,
            onClick: () => {
              setActiveCategory(activePost.categoryId);
            },
          });
          crumbs.push({ label: activePost.title });
        }
        break;

      case "messages":
        crumbs.push({ label: "私信通知" });
        break;

      case "favorites":
        crumbs.push({
          label: "收藏夹",
          onClick: () => setActiveFavoriteGroup("fg1"),
        });
        if (activeGroup && activeGroup.id !== "fg1") {
          crumbs.push({ label: activeGroup.name });
        }
        break;

      case "profile":
        crumbs.push({
          label: profileUser ? `${profileUser.nickname} 的主页` : "个人主页",
          onClick: () => setProfileUserId(profileUserId),
        });
        break;

      case "settings":
        crumbs.push({ label: "偏好设置" });
        break;

      case "editor":
        crumbs.push({ label: "发帖编辑器" });
        break;

      default:
        crumbs.push({ label: "首页" });
    }

    return crumbs;
  };

  const crumbs = getCrumbs();

  return (
    <nav className="flex items-center gap-1.5 text-sm select-none" aria-label="breadcrumb">
      <button
        type="button"
        onClick={() => setActivePanel("feed")}
        className={cn(
          "flex items-center gap-1 rounded-md px-2 py-1 transition-colors",
          "hover:bg-black/5 dark:hover:bg-white/5"
        )}
        style={{ color: "var(--app-text-secondary)" }}
      >
        <Home className="w-3.5 h-3.5" />
      </button>
      {crumbs.map((crumb, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <ChevronRight
            className="w-3.5 h-3.5 flex-shrink-0"
            style={{ color: "var(--app-text-tertiary)" }}
          />
          {crumb.onClick ? (
            <button
              type="button"
              onClick={crumb.onClick}
              className={cn(
                "rounded-md px-2 py-1 transition-colors truncate max-w-[200px]",
                "hover:bg-black/5 dark:hover:bg-white/5",
                idx === crumbs.length - 1
                  ? "font-medium"
                  : ""
              )}
              style={{
                color:
                  idx === crumbs.length - 1
                    ? "var(--app-text-primary)"
                    : "var(--app-text-secondary)",
              }}
            >
              {crumb.label}
            </button>
          ) : (
            <span
              className={cn(
                "px-2 py-1 truncate max-w-[200px]",
                idx === crumbs.length - 1 ? "font-medium" : ""
              )}
              style={{
                color:
                  idx === crumbs.length - 1
                    ? "var(--app-text-primary)"
                    : "var(--app-text-secondary)",
              }}
            >
              {crumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

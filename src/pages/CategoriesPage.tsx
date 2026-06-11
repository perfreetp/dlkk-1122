import { useState, useMemo } from "react";
import { useAppStore } from "@/stores/appStore";
import { CATEGORIES, USERS } from "@/mock";
import { PostCard } from "./FeedPage";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Empty from "@/components/ui/Empty";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  Users,
  FileText,
  Eye,
  ScrollText,
  ChevronDown,
  Plus,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import type { Category } from "@/types";

function getIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[name] || LucideIcons.Folder;
}

function CategoryNavItem({
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
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150",
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
          <ChevronRight
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
        <span
          className="text-[10px]"
          style={{
            color: isActive ? "rgba(255,255,255,0.7)" : "var(--app-text-tertiary)",
          }}
        >
          {formatNumber(category.postCount)}
        </span>
      </button>

      {hasChildren && isExpanded && (
        <div className="mt-0.5">
          {category.children!.map((child) => (
            <CategoryNavItem
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

export default function CategoriesPage() {
  const { activeCategoryId, setActiveCategory, getFilteredPosts, posts } = useAppStore();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(CATEGORIES.filter((c) => c.children && c.children.length > 0).map((c) => c.id))
  );
  const [showRules, setShowRules] = useState(false);
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set());

  const allCategories = useMemo(() => {
    const result: Category[] = [];
    CATEGORIES.forEach((c) => {
      result.push(c);
      if (c.children) result.push(...c.children);
    });
    return result;
  }, []);

  const activeCategory = allCategories.find((c) => c.id === activeCategoryId);

  const moderators = activeCategory
    ? USERS.filter((u) => activeCategory.moderators.includes(u.id))
    : [];

  const categoryPosts = useMemo(() => {
    if (!activeCategory) return [];
    const childIds = activeCategory.children?.map((c) => c.id) || [];
    return getFilteredPosts().filter(
      (p) =>
        p.categoryId === activeCategory.id ||
        childIds.includes(p.categoryId)
    ).sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [activeCategory, posts, getFilteredPosts]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSubscribe = (id: string) => {
    setSubscribed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="h-full flex overflow-hidden">
      <div
        className="w-72 flex-shrink-0 border-r flex flex-col h-full"
        style={{ borderRightColor: "var(--app-border)", background: "var(--app-surface)" }}
      >
        <div className="flex-shrink-0 px-4 py-3 border-b flex items-center justify-between" style={{ borderBottomColor: "var(--app-border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--app-text-primary)" }}>
            所有分区
          </h2>
          <span
            className="text-xs"
            style={{ color: "var(--app-text-tertiary)" }}
          >
            {CATEGORIES.length} 个主分区
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {CATEGORIES.map((cat) => (
            <CategoryNavItem
              key={cat.id}
              category={cat}
              activeId={activeCategoryId}
              onSelect={setActiveCategory}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        {activeCategory ? (
          <div className="p-4 max-w-4xl mx-auto">
            <div
              className="rounded-2xl p-6 mb-4 relative overflow-hidden"
              style={{
                background: "var(--app-surface)",
                border: "1px solid var(--app-border)",
              }}
            >
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at top right, var(--app-accent) 0%, transparent 50%)",
                }}
              />
              <div className="relative">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--app-accent) 0%, var(--app-accent-hover) 100%)",
                      }}
                    >
                      {(() => {
                        const Icon = getIcon(activeCategory.icon);
                        return <Icon className="w-7 h-7 text-white" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1
                        className="text-xl font-bold mb-1"
                        style={{ color: "var(--app-text-primary)" }}
                      >
                        {activeCategory.name}
                      </h1>
                      <p
                        className="text-sm mb-3"
                        style={{ color: "var(--app-text-secondary)" }}
                      >
                        {activeCategory.description}
                      </p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1 text-xs"
                          style={{ color: "var(--app-text-tertiary)" }}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {formatNumber(activeCategory.postCount)} 帖子
                        </span>
                        {activeCategory.unreadCount && activeCategory.unreadCount > 0 && (
                          <span
                            className="inline-flex items-center gap-1 text-xs"
                            style={{ color: "var(--app-danger)" }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {activeCategory.unreadCount} 未读
                          </span>
                        )}
                        {moderators.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs"
                              style={{ color: "var(--app-text-tertiary)" }}
                            >
                              版主:
                            </span>
                            <div className="flex items-center -space-x-2">
                              {moderators.map((mod) => (
                                <Avatar
                                  key={mod.id}
                                  src={mod.avatar}
                                  name={mod.nickname}
                                  size="xs"
                                  ring
                                  title={mod.nickname}
                                />
                              ))}
                            </div>
                            {moderators.map((mod) => (
                              <span
                                key={`name-${mod.id}`}
                                className="text-xs"
                                style={{ color: "var(--app-text-secondary)" }}
                              >
                                {mod.nickname}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Button
                      variant="icon"
                      size="md"
                      title="分区设置"
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={subscribed.has(activeCategory.id) ? "secondary" : "primary"}
                      size="md"
                      onClick={() => toggleSubscribe(activeCategory.id)}
                      leftIcon={
                        subscribed.has(activeCategory.id) ? (
                          <ScrollText className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )
                      }
                    >
                      {subscribed.has(activeCategory.id) ? "已订阅" : "订阅"}
                    </Button>
                  </div>
                </div>

                {activeCategory.rules && (
                  <div
                    className="rounded-xl p-4 mt-4"
                    style={{ background: "var(--app-surface-secondary)" }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowRules(!showRules)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span
                        className="text-sm font-medium flex items-center gap-2"
                        style={{ color: "var(--app-text-primary)" }}
                      >
                        <ScrollText className="w-4 h-4" />
                        分区规则
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          showRules ? "rotate-180" : ""
                        )}
                        style={{ color: "var(--app-text-tertiary)" }}
                      />
                    </button>
                    {showRules && (
                      <div
                        className="mt-3 pt-3 text-sm leading-relaxed whitespace-pre-line"
                        style={{
                          color: "var(--app-text-secondary)",
                          borderTop: "1px solid var(--app-border)",
                        }}
                      >
                        {activeCategory.rules}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "var(--app-text-primary)" }}
                >
                  分区帖子
                  <span
                    className="ml-2 text-xs font-normal"
                    style={{ color: "var(--app-text-tertiary)" }}
                  >
                    {categoryPosts.length} 篇
                  </span>
                </h3>
              </div>

              {categoryPosts.length > 0 ? (
                categoryPosts.map((post) => (
                  <PostCard key={post.id} post={post} showPin={false} />
                ))
              ) : (
                <Empty type="posts" />
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="p-6 max-w-5xl mx-auto w-full">
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: "var(--app-text-primary)" }}
              >
                浏览全部分区
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="rounded-xl p-5 transition-all cursor-pointer group"
                    style={{
                      background: "var(--app-surface)",
                      border: "1px solid var(--app-border)",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--app-accent) 0%, var(--app-accent-hover) 100%)",
                        }}
                      >
                        {(() => {
                          const Icon = getIcon(cat.icon);
                          return <Icon className="w-6 h-6 text-white" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className="text-base font-semibold truncate group-hover:opacity-80"
                            style={{ color: "var(--app-text-primary)" }}
                          >
                            {cat.name}
                          </h3>
                          {cat.unreadCount && cat.unreadCount > 0 && (
                            <Badge variant="danger" size="sm" count={cat.unreadCount} />
                          )}
                        </div>
                        <p
                          className="text-xs line-clamp-2 mb-3"
                          style={{ color: "var(--app-text-secondary)" }}
                        >
                          {cat.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span style={{ color: "var(--app-text-tertiary)" }}>
                            {formatNumber(cat.postCount)} 帖子
                          </span>
                          {cat.children && cat.children.length > 0 && (
                            <span style={{ color: "var(--app-text-tertiary)" }}>
                              {cat.children.length} 子分区
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {cat.children && cat.children.length > 0 && (
                      <div
                        className="mt-4 pt-4 flex flex-wrap gap-1.5"
                        style={{ borderTop: "1px solid var(--app-border)" }}
                      >
                        {cat.children.slice(0, 4).map((child) => (
                          <button
                            key={child.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCategory(child.id);
                            }}
                            className="text-xs px-2.5 py-1 rounded-md transition-colors"
                            style={{
                              background: "var(--app-surface-secondary)",
                              color: "var(--app-text-secondary)",
                            }}
                          >
                            {child.name}
                          </button>
                        ))}
                        {cat.children.length > 4 && (
                          <span
                            className="text-xs px-2 py-1"
                            style={{ color: "var(--app-text-tertiary)" }}
                          >
                            +{cat.children.length - 4} 更多
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

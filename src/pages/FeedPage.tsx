import { useMemo } from "react";
import { useAppStore } from "@/stores/appStore";
import { TAGS } from "@/mock";
import { OS_VERSIONS, MAC_MODELS, type SortType, type Post } from "@/types";
import Avatar from "@/components/ui/Avatar";
import Tag from "@/components/ui/Tag";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import type { DropdownItem } from "@/components/ui/Dropdown";
import Empty from "@/components/ui/Empty";
import Skeleton from "@/components/ui/Skeleton";
import Tabs from "@/components/ui/Tabs";
import {
  Pin,
  Crown,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  Clock,
  Filter,
  X,
  Flame,
  Sparkles,
  Zap,
  Ban,
  Settings,
  Trash2,
} from "lucide-react";
import { cn, formatNumber, formatTime } from "@/lib/utils";

const SORT_OPTIONS: { key: SortType; label: string; icon: any }[] = [
  { key: "hot", label: "热度", icon: Flame },
  { key: "latest", label: "最新", icon: Clock },
  { key: "essence", label: "精华", icon: Sparkles },
];

function PostCard({ post, showPin = true }: { post: Post; showPin?: boolean }) {
  const { likePost, setActivePost, setFeedFilter, setActivePanel, isPostFavorited, toggleFavoriteInGroup, getPostFavoriteGroups, unfavoritePost, favoriteGroups } = useAppStore();

  const favorited = isPostFavorited(post.id);
  const postFavGroups = getPostFavoriteGroups(post.id);

  return (
    <article
      className={cn(
        "rounded-xl p-5 transition-all duration-200 cursor-pointer group",
        post.isPinned && showPin
          ? "ring-1 ring-[var(--app-warning)]/40"
          : ""
      )}
      style={{
        background: "var(--app-surface)",
        border: `1px solid ${
          post.isPinned && showPin
            ? "color-mix(in srgb, var(--app-warning) 30%, transparent)"
            : "var(--app-border)"
        }`,
      }}
      onClick={() => setActivePost(post.id)}
    >
      <div className="flex items-start gap-3">
        <Avatar
          src={post.author.avatar}
          name={post.author.nickname}
          size="md"
          className="flex-shrink-0 cursor-pointer hover:ring-2 transition-all"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span
              className="text-sm font-semibold truncate"
              style={{ color: "var(--app-text-primary)" }}
            >
              {post.author.nickname}
            </span>
            <Badge variant="primary" size="sm">
              Lv.{post.author.level}
            </Badge>
            {showPin && post.isPinned && (
              <Badge variant="warning" size="sm">
                <Pin className="w-3 h-3" /> 置顶
              </Badge>
            )}
            {post.isEssence && (
              <Badge variant="primary" size="sm">
                <Crown className="w-3 h-3" /> 精华
              </Badge>
            )}
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: "var(--app-text-tertiary)" }}
            >
              <Clock className="w-3 h-3" />
              {formatTime(post.createdAt)}
            </span>
          </div>

          <h3
            className={cn(
              "text-base font-semibold mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity",
              post.isPinned && showPin ? "" : ""
            )}
            style={{ color: "var(--app-text-primary)" }}
          >
            {post.title}
          </h3>

          {post.tags.filter(Boolean).length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {post.tags.filter(Boolean).slice(0, 4).map((tag) => (
                <Tag
                  key={tag.id}
                  color={tag.color}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFeedFilter({ tagId: tag.id });
                    setActivePanel("feed");
                  }}
                >
                  {tag.name}
                </Tag>
              ))}
            </div>
          )}

          <p
            className="text-sm line-clamp-2 mb-3"
            style={{ color: "var(--app-text-secondary)" }}
          >
            {post.content.replace(/[#*`\[\]()>-]/g, "").slice(0, 200)}...
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span
                className="inline-flex items-center gap-1 text-xs"
                style={{ color: "var(--app-text-tertiary)" }}
              >
                <Eye className="w-3.5 h-3.5" />
                {formatNumber(post.viewCount)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  likePost(post.id);
                }}
                className={cn(
                  "inline-flex items-center gap-1 text-xs transition-colors",
                  post.isLiked
                    ? ""
                    : "hover:text-[var(--app-danger)]"
                )}
                style={{
                  color: post.isLiked ? "var(--app-danger)" : "var(--app-text-tertiary)",
                }}
              >
                <Heart
                  className={cn("w-3.5 h-3.5", post.isLiked ? "fill-current" : "")}
                />
                {formatNumber(post.likeCount)}
              </button>
              <span
                className="inline-flex items-center gap-1 text-xs"
                style={{ color: "var(--app-text-tertiary)" }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {formatNumber(post.replyCount)}
              </span>
              <Dropdown
                trigger={
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "inline-flex items-center gap-1 text-xs transition-colors",
                      favorited ? "" : "hover:text-[var(--app-warning)]"
                    )}
                    style={{
                      color: favorited ? "var(--app-warning)" : "var(--app-text-tertiary)",
                    }}
                  >
                    <Bookmark
                      className={cn("w-3.5 h-3.5", favorited ? "fill-current" : "")}
                    />
                    {formatNumber(post.favoriteCount)}
                  </button>
                }
                items={
                  favorited
                    ? [
                        {
                          key: "remove-all",
                          label: "从所有分组移除",
                          icon: <Trash2 className="w-4 h-4" />,
                          danger: true,
                          onClick: () => unfavoritePost(post.id),
                        },
                        {
                          key: "manage",
                          label: "管理分组",
                          icon: <Settings className="w-4 h-4" />,
                          onClick: () => {
                            setActivePanel("favorites");
                          },
                        },
                        { key: "div1", label: "", divider: true } as DropdownItem,
                        ...favoriteGroups.map<DropdownItem>((g) => ({
                          key: g.id,
                          label: (
                            <span className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: g.color }}
                              />
                              <span>{g.name}</span>
                              {postFavGroups.includes(g.id) && (
                                <span className="ml-auto" style={{ color: "var(--app-accent)" }}>✓</span>
                              )}
                            </span>
                          ),
                          onClick: () => toggleFavoriteInGroup(post.id, g.id),
                        })),
                      ]
                    : favoriteGroups.map<DropdownItem>((g) => ({
                        key: g.id,
                        label: (
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ background: g.color }}
                            />
                            <span>{g.name}</span>
                            <span className="ml-auto text-[10px]" style={{ color: "var(--app-text-tertiary)" }}>
                              {g.itemCount}
                            </span>
                          </span>
                        ),
                        onClick: () => toggleFavoriteInGroup(post.id, g.id),
                      }))
                }
                placement="bottom-left"
                menuClassName="min-w-[180px]"
              />
            </div>

            {(post.osVersion || post.macModel) && (
              <div className="flex items-center gap-1.5">
                {post.osVersion && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--app-surface-secondary)",
                      color: "var(--app-text-secondary)",
                    }}
                  >
                    {OS_VERSIONS.find((o) => o.value === post.osVersion)?.label?.split(" ")[1] || ""}
                  </span>
                )}
                {post.macModel && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--app-surface-secondary)",
                      color: "var(--app-text-secondary)",
                    }}
                  >
                    {MAC_MODELS.find((m) => m.value === post.macModel)?.label?.replace('"', "").split(" ").slice(0, 2).join(" ") || ""}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function FeedPage() {
  const { feedFilter, setFeedFilter, getFilteredPosts, getBlockedUserIds, posts, setActivePanel } = useAppStore();

  const filteredPosts = useMemo(() => {
    let result = [...getFilteredPosts()];

    if (feedFilter.sort === "essence") {
      result = result.filter((p) => p.isEssence);
    }
    if (feedFilter.osVersion) {
      result = result.filter((p) => p.osVersion === feedFilter.osVersion);
    }
    if (feedFilter.macModel) {
      result = result.filter((p) => p.macModel === feedFilter.macModel);
    }
    if (feedFilter.tagId) {
      result = result.filter((p) => p.tags.some((t) => t.id === feedFilter.tagId));
    }
    if (feedFilter.keyword) {
      const kw = feedFilter.keyword.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(kw) ||
          p.content.toLowerCase().includes(kw)
      );
    }

    if (feedFilter.sort === "hot") {
      result.sort((a, b) => {
        const scoreA = a.likeCount * 3 + a.replyCount * 5 + a.viewCount * 0.1;
        const scoreB = b.likeCount * 3 + b.replyCount * 5 + b.viewCount * 0.1;
        return scoreB - scoreA;
      });
    } else if (feedFilter.sort === "latest") {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    const pinned = result.filter((p) => p.isPinned);
    const others = result.filter((p) => !p.isPinned);
    return [...pinned, ...others];
  }, [posts, feedFilter, getFilteredPosts]);

  const hasFilter =
    feedFilter.osVersion ||
    feedFilter.macModel ||
    feedFilter.tagId ||
    feedFilter.keyword;

  const blockedCount = getBlockedUserIds().length;
  const isBlockedEmpty = filteredPosts.length === 0 && !hasFilter && blockedCount > 0;

  const hotTags = TAGS.slice(0, 12);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div
        className="flex-shrink-0 sticky top-0 z-20 vibrant-toolbar border-b"
        style={{ borderBottomColor: "var(--app-border)" }}
      >
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <Tabs
              variant="segmented"
              size="sm"
              items={SORT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return {
                  key: opt.key,
                  label: opt.label,
                  icon: <Icon className="w-3.5 h-3.5" />,
                };
              })}
              activeKey={feedFilter.sort}
              onChange={(k) => setFeedFilter({ sort: k as SortType })}
              className="w-auto"
            />

            {hasFilter && (
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<X className="w-3.5 h-3.5" />}
                onClick={() =>
                  setFeedFilter({
                    osVersion: undefined,
                    macModel: undefined,
                    tagId: undefined,
                    keyword: undefined,
                  })
                }
              >
                清除筛选
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: "var(--app-text-tertiary)" }}
              />
              <select
                className="mac-select text-xs h-8 !py-1 min-w-[140px]"
                value={feedFilter.osVersion || ""}
                onChange={(e) => setFeedFilter({ osVersion: e.target.value || undefined })}
              >
                <option value="">全部系统版本</option>
                {OS_VERSIONS.map((os) => (
                  <option key={os.value} value={os.value}>
                    {os.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              className="mac-select text-xs h-8 !py-1 min-w-[160px]"
              value={feedFilter.macModel || ""}
              onChange={(e) => setFeedFilter({ macModel: e.target.value || undefined })}
            >
              <option value="">全部机型</option>
              {MAC_MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <div className="flex-1 min-w-[200px] h-0.5" />

            <div className="flex items-center gap-1.5 flex-wrap">
              {TAGS.slice(0, 8).map((tag) => (
                <Tag
                  key={tag.id}
                  color={tag.color}
                  size="sm"
                  variant={feedFilter.tagId === tag.id ? "solid" : "soft"}
                  onClick={() =>
                    setFeedFilter({
                      tagId: feedFilter.tagId === tag.id ? undefined : tag.id,
                    })
                  }
                >
                  {tag.hot && <Zap className="w-3 h-3" />}
                  {tag.name}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        <div
          className="px-4 pb-3 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex items-center gap-2 min-w-max">
            {hotTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  setFeedFilter({
                    tagId: feedFilter.tagId === tag.id ? undefined : tag.id,
                  })
                }
                className={cn(
                  "flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all",
                  feedFilter.tagId === tag.id
                    ? "shadow-sm"
                    : "hover:shadow-sm"
                )}
                style={{
                  background:
                    feedFilter.tagId === tag.id
                      ? tag.color
                      : `${tag.color}15`,
                  color:
                    feedFilter.tagId === tag.id
                      ? "#fff"
                      : tag.color,
                }}
              >
                {tag.hot && <Zap className="w-3 h-3" />}
                <span>{tag.name}</span>
                <span
                  className="text-[10px] opacity-70"
                >
                  {formatNumber(tag.postCount)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 space-y-3 max-w-3xl mx-auto">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : hasFilter ? (
            <Empty type="search" />
          ) : isBlockedEmpty ? (
            <Empty
              type="posts"
              icon={Ban}
              title="暂无可见帖子"
              description={`你已屏蔽 ${blockedCount} 位用户，导致没有可显示的内容。可以在设置中管理屏蔽列表。`}
              actionLabel="管理屏蔽设置"
              onAction={() => {
                setActivePanel("settings");
              }}
            />
          ) : (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-xl p-5" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}>
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-10" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex items-center gap-4 pt-1">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {filteredPosts.length > 0 && (
            <div className="py-6 text-center">
              <div
                className="text-xs flex items-center justify-center gap-2"
                style={{ color: "var(--app-text-tertiary)" }}
              >
                <span className="block h-px w-16" style={{ background: "var(--app-border)" }}></span>
                已加载全部
                <span className="block h-px w-16" style={{ background: "var(--app-border)" }}></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { PostCard };

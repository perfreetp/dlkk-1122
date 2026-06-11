import { useState, useMemo } from "react";
import { useAppStore } from "@/stores/appStore";
import { USERS } from "@/mock";
import { PostCard } from "./FeedPage";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import Tag from "@/components/ui/Tag";
import Empty from "@/components/ui/Empty";
import * as LucideIcons from "lucide-react";
import {
  FileText,
  MessageSquare,
  Heart,
  UserPlus,
  UserMinus,
  Users,
  Pencil,
  Award,
  Calendar,
  UserCheck,
  ExternalLink,
  MoreHorizontal,
  Ban,
  MessageCircle,
  ChevronRight,
  ThumbsUp,
  Apple,
  Clock,
  Trash2,
} from "lucide-react";
import { formatNumber, formatDate, getOSVersionLabel, getMacModelLabel } from "@/lib/utils";
import type { TabItem } from "@/components/ui/Tabs";
import type { Post, Reply, FavoriteItem, FavoriteGroup } from "@/types";
import type { CSSProperties, ComponentType } from "react";

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
];

type TimelineActivityType =
  | "post_publish"
  | "post_edit"
  | "reply_publish"
  | "reply_edit"
  | "reply_delete"
  | "favorite_add";

interface TimelineItem {
  id: string;
  type: TimelineActivityType;
  timestamp: string;
  postId: string;
  postTitle: string;
  content?: string;
  replyId?: string;
  groupId?: string;
  groupName?: string;
  groupColor?: string;
  isDeleted?: boolean;
  isEdited?: boolean;
}

const TAB_DEFS: TabItem[] = [
  { key: "posts", label: "发帖", icon: <FileText className="w-4 h-4" /> },
  { key: "replies", label: "回复", icon: <MessageSquare className="w-4 h-4" /> },
  { key: "favorites", label: "收藏", icon: <Heart className="w-4 h-4" /> },
  { key: "timeline", label: "时间线", icon: <Clock className="w-4 h-4" /> },
  { key: "following", label: "关注", icon: <UserPlus className="w-4 h-4" /> },
  { key: "followers", label: "粉丝", icon: <Users className="w-4 h-4" /> },
];

export default function ProfilePage() {
  const {
    currentUser,
    profileUserId,
    setProfileUserId,
    activeProfileTab,
    setActiveProfileTab,
    setActivePost,
    setActiveConversation,
    conversations,
    setActivePanel,
    toggleBlockUser,
    getFilteredPosts,
    getBlockedUserIds,
    getRepliesByPostId,
    favoriteItems,
    favoriteGroups,
    getPostById,
    setActiveFavoriteGroup,
  } = useAppStore();

  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const user = useMemo(() => {
    return USERS.find((u) => u.id === profileUserId) || currentUser;
  }, [profileUserId, currentUser]);

  const isOwn = user.id === currentUser.id;
  const gradientIdx = Math.abs(
    (user.id.charCodeAt(user.id.length - 1) || 0) % COVER_GRADIENTS.length
  );
  const coverGradient = COVER_GRADIENTS[gradientIdx];

  const isBlocked = useMemo(() => {
    return getBlockedUserIds().includes(user.id);
  }, [user.id, getBlockedUserIds]);

  const userPosts = useMemo(() => {
    return getFilteredPosts()
      .filter((p) => p.authorId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [user.id, getFilteredPosts]);

  const userReplies = useMemo(() => {
    const allReplies: (Reply & { postId: string; postTitle: string })[] = [];
    const posts = getFilteredPosts();
    posts.forEach((post) => {
      const replies = getRepliesByPostId(post.id);
      replies
        .filter((r) => r.authorId === user.id)
        .forEach((r) => allReplies.push({ ...r, postId: post.id, postTitle: post.title }));
    });
    return allReplies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [user.id, getFilteredPosts, getRepliesByPostId]);

  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    userPosts.forEach((post) => {
      items.push({
        id: `post-${post.id}`,
        type: "post_publish",
        timestamp: post.createdAt,
        postId: post.id,
        postTitle: post.title,
        content: post.content.slice(0, 100),
      });
    });

    userReplies.forEach((reply) => {
      if (reply.isDeleted) {
        items.push({
          id: `reply-del-${reply.id}`,
          type: "reply_delete",
          timestamp: reply.deletedAt || reply.createdAt,
          postId: reply.postId,
          postTitle: reply.postTitle,
          replyId: reply.id,
          isDeleted: true,
        });
      } else {
        items.push({
          id: `reply-${reply.id}`,
          type: "reply_publish",
          timestamp: reply.createdAt,
          postId: reply.postId,
          postTitle: reply.postTitle,
          replyId: reply.id,
          content: reply.content.slice(0, 100),
        });

        if (reply.isEdited) {
          items.push({
            id: `reply-edit-${reply.id}`,
            type: "reply_edit",
            timestamp: reply.editedAt || reply.createdAt,
            postId: reply.postId,
            postTitle: reply.postTitle,
            replyId: reply.id,
            isEdited: true,
          });
        }
      }
    });

    favoriteItems.forEach((fav) => {
      if (fav.targetType !== "post") return;
      const post = getPostById(fav.targetId);
      const group = favoriteGroups.find((g) => g.id === fav.groupId);
      if (post) {
        items.push({
          id: `fav-${fav.id}`,
          type: "favorite_add",
          timestamp: fav.addedAt,
          postId: post.id,
          postTitle: post.title,
          groupId: fav.groupId,
          groupName: group?.name,
          groupColor: group?.color,
        });
      }
    });

    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [userPosts, userReplies, favoriteItems, getPostById, favoriteGroups]);

  const userFavorites = useMemo(() => {
    type FavoriteWithPost = FavoriteItem & { post?: Post; group?: FavoriteGroup };
    const items = isOwn
      ? favoriteItems.filter((i) => i.targetType === "post")
      : favoriteItems.filter((i) => i.targetType === "post").slice(0, 6);
    
    return items.map((item): FavoriteWithPost => {
      const post = getPostById(item.targetId);
      const group = favoriteGroups.find((g) => g.id === item.groupId);
      return { ...item, post, group };
    });
  }, [isOwn, favoriteItems, favoriteGroups, getPostById]);

  const followingUsers = USERS.filter(
    (u) => u.id !== user.id && u.level > user.level * 0.5
  ).slice(0, 8);
  const followerUsers = USERS.filter(
    (u) => u.id !== user.id && u.level <= user.level * 0.8
  ).slice(0, 12);

  const isFollowing = followingMap[user.id] || false;

  const toggleFollow = (id: string) => {
    setFollowingMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isMutualFollow = (u: typeof USERS[number]) =>
    followingUsers.some((fu) => fu.id === u.id) &&
    followerUsers.some((fl) => fl.id === u.id);

  const handleMessage = () => {
    const existingConv = conversations.find((c) =>
      c.participants.some((p) => p.id === user.id)
    );
    if (existingConv) {
      setActiveConversation(existingConv.id);
    }
    setActivePanel("messages");
  };

  const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
  }: {
    label: string;
    value: number | string;
    icon: ComponentType<{ className?: string }>;
    color: string;
  }) => (
    <div
      className="flex items-center gap-3 p-4 rounded-xl"
      style={{
        background: "var(--app-surface)",
        border: "1px solid var(--app-border)",
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20`, color }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-xs"
          style={{ color: "var(--app-text-secondary)" }}
        >
          {label}
        </div>
        <div
          className="text-xl font-bold"
          style={{ color: "var(--app-text-primary)" }}
        >
          {typeof value === "number" ? formatNumber(value) : value}
        </div>
      </div>
    </div>
  );

  const renderPostsTab = () =>
    userPosts.length > 0 ? (
      <div className="space-y-3">
        {userPosts.map((post) => (
          <PostCard key={post.id} post={post} showPin={false} />
        ))}
      </div>
    ) : (
      <Empty
        type="posts"
        title="还没有发布帖子"
        description={isOwn ? "快来发布第一篇帖子吧" : "TA 还没有发布过帖子"}
      />
    );

  const renderRepliesTab = () =>
    userReplies.length > 0 ? (
      <div className="space-y-3">
        {userReplies.map((reply) => (
          <div
            key={reply.id}
            onClick={() => setActivePost(reply.postId)}
            className="rounded-xl p-4 transition-all cursor-pointer hover:shadow-sm"
            style={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <ChevronRight
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "var(--app-text-tertiary)" }}
              />
              <span
                className="text-sm font-medium truncate"
                style={{ color: "var(--app-text-primary)" }}
              >
                回复了帖子:{" "}
                <span style={{ color: "var(--app-accent)" }}>
                  {reply.postTitle || "(已删除)"}
                </span>
              </span>
              {reply.isEdited && !reply.isDeleted && (
                <Badge variant="gray" size="sm">
                  已编辑
                </Badge>
              )}
            </div>
            <div
              className="mt-2 text-sm line-clamp-3 pl-6"
              style={{ color: "var(--app-text-secondary)" }}
            >
              {reply.isDeleted ? (
                <span className="italic opacity-60">该回复已被撤回</span>
              ) : (
                reply.content
              )}
            </div>
            <div
              className="mt-3 flex items-center justify-between pl-6 text-xs"
              style={{ color: "var(--app-text-tertiary)" }}
            >
              <span>{formatDate(reply.createdAt)}</span>
              <span className="inline-flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {reply.likeCount}
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <Empty
        type="posts"
        title="还没有回复"
        description={isOwn ? "快去回复帖子吧" : "TA 还没有回复过帖子"}
      />
    );

  const renderFavoritesTab = () =>
    userFavorites.length > 0 ? (
      <div className="space-y-3">
        {userFavorites.map((item) => (
          <div
            key={item.id}
            onClick={() => item.targetType === "post" && item.post && setActivePost(item.post.id)}
            className="rounded-xl p-4 flex items-start gap-3 transition-all cursor-pointer hover:shadow-sm"
            style={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "color-mix(in srgb, var(--app-warning) 15%, transparent)",
              }}
            >
              <Heart className="w-5 h-5" style={{ color: "var(--app-warning)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-semibold line-clamp-2"
                style={{ color: "var(--app-text-primary)" }}
              >
                {item.post?.title || "(无标题)"}
              </div>
              {item.post?.content && (
                <div
                  className="text-xs mt-1 line-clamp-1"
                  style={{ color: "var(--app-text-secondary)" }}
                >
                  {item.post.content.replace(/[#*`[\]()>-]/g, "").slice(0, 80)}...
                </div>
              )}
              <div
                className="text-xs mt-2 flex items-center gap-2 flex-wrap"
                style={{ color: "var(--app-text-tertiary)" }}
              >
                {item.group?.name && (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
                    style={{
                      background: `${item.group.color || "#007AFF"}15`,
                      color: item.group.color || "#007AFF",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.group.color || "#007AFF" }} />
                    {item.group.name}
                  </span>
                )}
                <span>{formatDate(item.addedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <Empty type="favorites" />
    );

  const UserCard = ({
    u,
    followed,
  }: {
    u: typeof USERS[number];
    followed?: boolean;
  }) => (
    <div
      className="rounded-xl p-4 transition-all cursor-pointer group"
      style={{
        background: "var(--app-surface)",
        border: "1px solid var(--app-border)",
      }}
      onClick={() => setProfileUserId(u.id)}
    >
      <div className="flex items-start gap-3">
        <Avatar src={u.avatar} name={u.nickname} size="lg" ring />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className="text-sm font-semibold truncate"
                  style={{ color: "var(--app-text-primary)" }}
                >
                  {u.nickname}
                </span>
                {isMutualFollow(u) && (
                  <Badge variant="gray" size="sm">
                    <UserCheck className="w-3 h-3" /> 互关
                  </Badge>
                )}
              </div>
              <div
                className="text-[10px]"
                style={{ color: "var(--app-text-tertiary)" }}
              >
                @{u.username}
              </div>
            </div>
            <Button
              variant={followed ? "secondary" : "primary"}
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                toggleFollow(u.id);
              }}
            >
              {followed ? (
                <>
                  <UserMinus className="w-3 h-3 mr-1" />
                  已关注
                </>
              ) : (
                <>
                  <UserPlus className="w-3 h-3 mr-1" />
                  关注
                </>
              )}
            </Button>
          </div>
          {u.signature && (
            <p
              className="text-xs mt-2 line-clamp-2"
              style={{ color: "var(--app-text-secondary)" }}
            >
              {u.signature}
            </p>
          )}
          <div
            className="flex items-center gap-3 mt-3 text-[10px]"
            style={{ color: "var(--app-text-tertiary)" }}
          >
            <span className="inline-flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {formatNumber(u.postCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatNumber(u.followerCount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFollowingTab = () =>
    followingUsers.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {followingUsers.map((u) => (
          <UserCard key={u.id} u={u} followed={followingMap[u.id]} />
        ))}
      </div>
    ) : (
      <Empty type="users" />
    );

  const renderFollowersTab = () =>
    followerUsers.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {followerUsers.map((u) => (
          <UserCard
            key={u.id}
            u={u}
            followed={followingUsers.some((fu) => fu.id === u.id) || followingMap[u.id]}
          />
        ))}
      </div>
    ) : (
      <Empty type="users" />
    );

  const getActivityConfig = (type: TimelineActivityType) => {
    const configs: Record<TimelineActivityType, { icon: ComponentType<{ className?: string }>; label: string; color: string }> = {
      post_publish: { icon: FileText, label: "发布了帖子", color: "var(--app-accent)" },
      post_edit: { icon: Pencil, label: "编辑了帖子", color: "#FF9500" },
      reply_publish: { icon: MessageSquare, label: "回复了帖子", color: "#34C759" },
      reply_edit: { icon: Pencil, label: "编辑了回复", color: "#FF9500" },
      reply_delete: { icon: Trash2, label: "撤回了回复", color: "#FF3B30" },
      favorite_add: { icon: Heart, label: "收藏了帖子", color: "#FF2D55" },
    };
    return configs[type];
  };

  const renderTimelineTab = () =>
    timelineItems.length > 0 ? (
      <div className="relative">
        <div
          className="absolute left-5 top-2 bottom-2 w-0.5"
          style={{ background: "var(--app-border)" }}
        />
        <div className="space-y-4">
          {timelineItems.map((item) => {
            const config = getActivityConfig(item.type);
            const Icon = config.icon;
            return (
              <div key={item.id} className="relative flex gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4"
                  style={{
                    background: `${config.color}15`,
                    color: config.color,
                    borderColor: "var(--app-bg)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div
                  className={`flex-1 rounded-xl p-4 transition-all ${item.isDeleted ? "opacity-60" : ""}`}
                  style={{
                    background: "var(--app-surface)",
                    border: "1px solid var(--app-border)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-medium" style={{ color: config.color }}>
                      {config.label}
                    </span>
                    {item.isEdited && (
                      <Badge variant="gray" size="sm">
                        已编辑
                      </Badge>
                    )}
                    {item.isDeleted && (
                      <Badge variant="gray" size="sm">
                        已撤回
                      </Badge>
                    )}
                    <span
                      className="text-xs ml-auto"
                      style={{ color: "var(--app-text-tertiary)" }}
                    >
                      {formatDate(item.timestamp)}
                    </span>
                  </div>

                  <div
                    className={`text-sm font-semibold mb-2 cursor-pointer hover:underline ${item.isDeleted ? "line-through" : ""}`}
                    style={{ color: "var(--app-text-primary)" }}
                    onClick={() => setActivePost(item.postId)}
                  >
                    {item.postTitle || "(已删除)"}
                  </div>

                  {item.type === "favorite_add" && item.groupName && (
                    <div className="mb-2">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-pointer hover:opacity-80"
                        style={{
                          background: `${item.groupColor || "#007AFF"}15`,
                          color: item.groupColor || "#007AFF",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.groupId) {
                            setActiveFavoriteGroup(item.groupId);
                            setActivePanel("favorites");
                          }
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: item.groupColor || "#007AFF" }}
                        />
                        收藏至 {item.groupName}
                      </span>
                    </div>
                  )}

                  {item.content && !item.isDeleted && (
                    <div
                      className="text-sm line-clamp-2"
                      style={{ color: "var(--app-text-secondary)" }}
                    >
                      {item.content}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ) : (
      <Empty
        type="posts"
        title="还没有活动记录"
        description={isOwn ? "快去发帖、回复或收藏吧" : "TA 还没有活动记录"}
      />
    );

  const renderTabContent = () => {
    switch (activeProfileTab) {
      case "posts":
        return renderPostsTab();
      case "replies":
        return renderRepliesTab();
      case "favorites":
        return renderFavoritesTab();
      case "timeline":
        return renderTimelineTab();
      case "following":
        return renderFollowingTab();
      case "followers":
        return renderFollowersTab();
      default:
        return renderPostsTab();
    }
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden app-transition"
      style={{ background: "var(--app-bg)" }}
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="h-44 relative" style={{ background: coverGradient }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/20 backdrop-blur-sm text-white border-0 hover:bg-white/30"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">分享</span>
            </Button>
            <Button
              variant="icon"
              size="sm"
              className="bg-white/20 backdrop-blur-sm text-white border-0 hover:bg-white/30"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isBlocked && !isOwn && (
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{
              background: "color-mix(in srgb, var(--app-danger) 12%, transparent)",
              borderBottom: "1px solid var(--app-border)",
            }}
          >
            <div className="flex items-center gap-2">
              <Ban className="w-4 h-4" style={{ color: "var(--app-danger)" }} />
              <span className="text-sm" style={{ color: "var(--app-text-primary)" }}>
                该用户已被屏蔽
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toggleBlockUser(user.id, user.nickname)}
            >
              解除屏蔽
            </Button>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-5">
          <div className="relative -mt-16 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="relative">
                  <Avatar
                    src={user.avatar}
                    name={user.nickname}
                    size="2xl"
                    ring
                    className="ring-offset-4"
                    style={{
                      boxShadow:
                        "0 0 0 4px var(--app-bg), 0 8px 24px -8px rgba(0,0,0,0.15)",
                      "--tw-ring-color": "var(--app-border)",
                    } as CSSProperties}
                  />
                  <div
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--app-accent) 0%, var(--app-accent-hover) 100%)",
                    }}
                  >
                    <Apple className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="pb-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1
                      className="text-2xl font-bold truncate"
                      style={{ color: "var(--app-text-primary)" }}
                    >
                      {user.nickname}
                    </h1>
                    {user.badges?.slice(0, 3).map((badge) => {
                      const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[badge.icon];
                      return (
                        <Badge
                          key={badge.id}
                          size="sm"
                          style={{ background: badge.color } as CSSProperties}
                        >
                          {Icon && <Icon className="w-3 h-3 mr-0.5" />}
                          {badge.name}
                        </Badge>
                      );
                    })}
                    <Badge variant="primary" size="sm">
                      Lv.{user.level}
                    </Badge>
                    <Badge variant="success" size="sm">
                      <Apple className="w-3 h-3" /> Apple 认证
                    </Badge>
                  </div>
                  <div
                    className="text-sm mt-1 flex items-center gap-2 flex-wrap"
                    style={{ color: "var(--app-text-secondary)" }}
                  >
                    <span>@{user.username}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      加入于 {formatDate(user.createdAt)}
                    </span>
                  </div>
                  {user.signature && (
                    <p
                      className="text-sm mt-2 max-w-xl"
                      style={{ color: "var(--app-text-primary)" }}
                    >
                      {user.signature}
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    {user.macModel && (
                      <Tag color="#007AFF" size="sm" variant="soft">
                        💻 {getMacModelLabel(user.macModel)}
                      </Tag>
                    )}
                    {user.osVersion && (
                      <Tag color="#34C759" size="sm" variant="soft">
                        🍎 {getOSVersionLabel(user.osVersion)}
                      </Tag>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap pb-2">
                {isOwn ? (
                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={<Pencil className="w-4 h-4" />}
                  >
                    编辑资料
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={isFollowing ? "secondary" : "primary"}
                      size="md"
                      onClick={() => toggleFollow(user.id)}
                      leftIcon={
                        isFollowing ? (
                          <UserMinus className="w-4 h-4" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )
                      }
                    >
                      {isFollowing ? "已关注" : "关注"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={handleMessage}
                      leftIcon={<MessageCircle className="w-4 h-4" />}
                    >
                      发私信
                    </Button>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => toggleBlockUser(user.id, user.nickname)}
                      leftIcon={<Ban className="w-4 h-4" />}
                    >
                      屏蔽
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <StatCard
              label="发帖数"
              value={user.postCount}
              icon={FileText}
              color="#007AFF"
            />
            <StatCard
              label="回复数"
              value={user.replyCount}
              icon={MessageSquare}
              color="#34C759"
            />
            <StatCard
              label="获赞数"
              value={user.postCount * 23 + 567}
              icon={Award}
              color="#FF9500"
            />
            <StatCard
              label="粉丝"
              value={user.followerCount}
              icon={Users}
              color="#AF52DE"
            />
            <StatCard
              label="关注"
              value={user.followingCount}
              icon={UserPlus}
              color="#FF2D55"
            />
          </div>

          <Tabs
            items={TAB_DEFS}
            activeKey={activeProfileTab}
            onChange={setActiveProfileTab}
            variant="segmented"
            className="mb-6"
          />

          <div className="pb-8">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}

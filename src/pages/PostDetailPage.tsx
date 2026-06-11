import { useState, useMemo } from "react";
import { useAppStore } from "@/stores/appStore";
import { POSTS, REPLIES, FAVORITE_GROUPS, USERS } from "@/mock";
import { OS_VERSIONS, MAC_MODELS } from "@/types";
import Avatar from "@/components/ui/Avatar";
import Tag from "@/components/ui/Tag";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import type { DropdownItem } from "@/components/ui/Dropdown";
import Empty from "@/components/ui/Empty";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  ArrowLeft,
  Pin,
  Crown,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Ban,
  Flag,
  Reply,
  Bold,
  Italic,
  Link,
  Image,
  Send,
  MoreHorizontal,
  ChevronUp,
  Crown as CrownIcon,
  AtSign,
  Smile,
} from "lucide-react";
import { cn, formatNumber, formatTime, getOSVersionLabel, getMacModelLabel } from "@/lib/utils";
import type { Reply as ReplyType, Post } from "@/types";

function ReplyItem({
  reply,
  postId,
  onReply,
}: {
  reply: ReplyType;
  postId: string;
  onReply: (r: ReplyType) => void;
}) {
  const { toggleBlockUser, setReportTarget, setProfileUserId } = useAppStore();
  const [liked, setLiked] = useState(reply.isLiked || false);
  const [likeCount, setLikeCount] = useState(reply.likeCount);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(likeCount + (liked ? -1 : 1));
  };

  const handleMentionClick = (userId: string) => {
    setProfileUserId(userId);
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(@[\u4e00-\u9fa5\w]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("@")) {
        const mentionedUser = USERS.find(
          (u) => u.nickname === part.slice(1)
        );
        if (mentionedUser) {
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleMentionClick(mentionedUser.id)}
              className="font-medium transition-opacity hover:opacity-80"
              style={{ color: "var(--app-accent)" }}
            >
              {part}
            </button>
          );
        }
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div
      id={`floor-${reply.floor}`}
      className="scroll-mt-20 rounded-xl p-5 transition-all group"
      style={{
        background: "var(--app-surface)",
        border: "1px solid var(--app-border)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={() => setProfileUserId(reply.authorId)}
            className="block hover:opacity-80 transition-opacity"
          >
            <Avatar
              src={reply.author.avatar}
              name={reply.author.nickname}
              size="md"
              ring
            />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setProfileUserId(reply.authorId)}
                className="text-sm font-semibold transition-opacity hover:opacity-80 truncate"
                style={{ color: "var(--app-text-primary)" }}
              >
                {reply.author.nickname}
              </button>
              <Badge variant="primary" size="sm">
                Lv.{reply.author.level}
              </Badge>
              {reply.author.macModel && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--app-surface-secondary)",
                    color: "var(--app-text-secondary)",
                  }}
                >
                  {reply.author.macModel.split(" ").slice(0, 2).join(" ")}
                </span>
              )}
              {reply.isEssence && (
                <Badge variant="primary" size="sm">
                  <CrownIcon className="w-3 h-3" /> 神回复
                </Badge>
              )}
              <span
                className="text-xs flex items-center gap-1"
                style={{ color: "var(--app-text-tertiary)" }}
              >
                {formatTime(reply.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <a
                href={`#floor-${reply.floor}`}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--app-text-tertiary)" }}
                title={`复制楼层链接`}
              >
                #{reply.floor} 楼
              </a>

              <Dropdown
                trigger={
                  <Button variant="icon" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                }
                items={[
                  {
                    key: "reply",
                    label: "回复引用",
                    icon: <Reply className="w-4 h-4" />,
                    onClick: () => onReply(reply),
                  },
                  {
                    key: "block",
                    label: `屏蔽 ${reply.author.nickname}`,
                    icon: <Ban className="w-4 h-4" />,
                    onClick: () =>
                      toggleBlockUser(reply.authorId, reply.author.nickname),
                  },
                  {
                    key: "report",
                    label: "举报",
                    icon: <Flag className="w-4 h-4" />,
                    danger: true,
                    onClick: () =>
                      setReportTarget({
                        type: "reply",
                        id: reply.id,
                        name: `${reply.author.nickname} 的回复`,
                      }),
                  },
                ]}
                placement="bottom-right"
              />
            </div>
          </div>

          {reply.replyToFloor && reply.replyToAuthor && (
            <div
              className="mb-3 p-3 rounded-lg text-sm"
              style={{
                background: "var(--app-surface-secondary)",
                borderLeft: "3px solid var(--app-accent)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => setProfileUserId(reply.replyToAuthor!.id)}
                  className="text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ color: "var(--app-accent)" }}
                >
                  @{reply.replyToAuthor.nickname}
                </button>
                <a
                  href={`#floor-${reply.replyToFloor}`}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--app-border)",
                    color: "var(--app-text-secondary)",
                  }}
                >
                  #{reply.replyToFloor}
                </a>
              </div>
              <p
                className="text-xs line-clamp-2"
                style={{ color: "var(--app-text-secondary)" }}
              >
                {reply.content.slice(0, 100)}...
              </p>
            </div>
          )}

          <div
            className="text-sm leading-relaxed mb-3 prose prose-sm max-w-none"
            style={{ color: "var(--app-text-primary)" }}
          >
            {renderContent(reply.content)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleLike}
                className={cn(
                  "inline-flex items-center gap-1 text-xs transition-colors",
                  liked ? "" : "hover:text-[var(--app-danger)]"
                )}
                style={{
                  color: liked ? "var(--app-danger)" : "var(--app-text-tertiary)",
                }}
              >
                <Heart className={cn("w-3.5 h-3.5", liked ? "fill-current" : "")} />
                {formatNumber(likeCount)}
              </button>
              <button
                type="button"
                onClick={() => onReply(reply)}
                className="inline-flex items-center gap-1 text-xs transition-colors hover:text-[var(--app-accent)]"
                style={{ color: "var(--app-text-tertiary)" }}
              >
                <Reply className="w-3.5 h-3.5" />
                回复
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const {
    activePostId,
    setActivePost,
    likePost,
    favoritePost,
    setFeedFilter,
    setProfileUserId,
    setReportTarget,
    toggleBlockUser,
    currentUser,
  } = useAppStore();

  const post: Post | undefined = useMemo(
    () => POSTS.find((p) => p.id === activePostId) || POSTS[0],
    [activePostId]
  );

  const replies = REPLIES[post?.id || ""] || [];
  const [replyTo, setReplyTo] = useState<ReplyType | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");

  const matchedUsers = USERS.filter((u) =>
    mentionFilter
      ? u.nickname.toLowerCase().includes(mentionFilter.toLowerCase())
      : false
  ).slice(0, 5);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setReplyContent(value);

    const match = value.match(/@([\u4e00-\u9fa5\w]*)$/);
    if (match) {
      setMentionFilter(match[1]);
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
    }
  };

  const insertMention = (nickname: string) => {
    const newValue = replyContent.replace(/@([\u4e00-\u9fa5\w]*)$/, `@${nickname} `);
    setReplyContent(newValue);
    setShowMentionList(false);
  };

  if (!post) {
    return (
      <div className="h-full flex items-center justify-center">
        <Empty type="posts" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div
        className="flex-shrink-0 sticky top-0 z-20 vibrant-toolbar border-b px-4 py-3"
        style={{ borderBottomColor: "var(--app-border)" }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setActivePost(undefined)}
            >
              返回
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--app-text-tertiary)" }}>
            <Eye className="w-3.5 h-3.5" />
            {formatNumber(post.viewCount)} 浏览
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 pb-32 max-w-4xl mx-auto">
          <article
            className="rounded-2xl p-6 mb-6"
            style={{
              background: "var(--app-surface)",
              border: `1px solid ${
                post.isPinned
                  ? "color-mix(in srgb, var(--app-warning) 30%, transparent)"
                  : "var(--app-border)"
              }`,
            }}
          >
            <div className="flex items-start gap-4 mb-5">
              <button
                type="button"
                onClick={() => setProfileUserId(post.authorId)}
                className="flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                <Avatar
                  src={post.author.avatar}
                  name={post.author.nickname}
                  size="lg"
                  ring
                  online={post.author.isOnline}
                />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <button
                    type="button"
                    onClick={() => setProfileUserId(post.authorId)}
                    className="text-base font-bold transition-opacity hover:opacity-80 truncate"
                    style={{ color: "var(--app-text-primary)" }}
                  >
                    {post.author.nickname}
                  </button>
                  <Badge variant="primary" size="sm">
                    Lv.{post.author.level}
                  </Badge>
                  {post.author.badges?.slice(0, 2).map((badge) => (
                    <Badge key={badge.id} size="sm" color={badge.color}>
                      {badge.name}
                    </Badge>
                  ))}
                  {post.author.macModel && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--app-surface-secondary)",
                        color: "var(--app-text-secondary)",
                      }}
                    >
                      {post.author.macModel.split('"')[0]}
                    </span>
                  )}
                  {post.isPinned && (
                    <Badge variant="warning" size="sm">
                      <Pin className="w-3 h-3" /> 置顶
                    </Badge>
                  )}
                  {post.isEssence && (
                    <Badge variant="primary" size="sm">
                      <Crown className="w-3 h-3" /> 精华
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: "var(--app-text-tertiary)" }}>
                  <span>@{post.author.username}</span>
                  <span>·</span>
                  <span>{formatTime(post.createdAt)}</span>
                  {post.createdAt !== post.updatedAt && (
                    <>
                      <span>·</span>
                      <span>编辑于 {formatTime(post.updatedAt)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {post.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mb-4">
                {post.tags.map((tag) => (
                  <Tag
                    key={tag.id}
                    color={tag.color}
                    size="sm"
                    onClick={() => setFeedFilter({ tagId: tag.id, sort: "hot" })}
                  >
                    #{tag.name}
                  </Tag>
                ))}
              </div>
            )}

            <h1
              className="text-2xl font-bold mb-5 leading-tight"
              style={{ color: "var(--app-text-primary)" }}
            >
              {post.title}
            </h1>

            <MarkdownRenderer content={post.content} className="mb-6" />

            {(post.osVersion || post.macModel) && (
              <div
                className="flex items-center gap-2 flex-wrap mb-5 p-3 rounded-xl"
                style={{ background: "var(--app-surface-secondary)" }}
              >
                <span className="text-xs" style={{ color: "var(--app-text-tertiary)" }}>
                  关联标签:
                </span>
                {post.osVersion && (
                  <button
                    type="button"
                    onClick={() =>
                      setFeedFilter({ osVersion: post.osVersion, sort: "hot" })
                    }
                    className="text-xs px-2.5 py-1 rounded-full transition-all hover:opacity-80"
                    style={{
                      background: "var(--app-accent)",
                      color: "#fff",
                    }}
                  >
                    {getOSVersionLabel(post.osVersion)}
                  </button>
                )}
                {post.macModel && (
                  <button
                    type="button"
                    onClick={() =>
                      setFeedFilter({ macModel: post.macModel, sort: "hot" })
                    }
                    className="text-xs px-2.5 py-1 rounded-full transition-all hover:opacity-80"
                    style={{
                      background: "var(--app-accent-hover)",
                      color: "#fff",
                    }}
                  >
                    {getMacModelLabel(post.macModel)}
                  </button>
                )}
              </div>
            )}

            <div
              className="pt-5"
              style={{ borderTop: "1px solid var(--app-border)" }}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => likePost(post.id)}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      post.isLiked
                        ? "shadow-sm"
                        : "hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                    style={{
                      background: post.isLiked
                        ? "color-mix(in srgb, var(--app-danger) 15%, transparent)"
                        : "transparent",
                      color: post.isLiked ? "var(--app-danger)" : "var(--app-text-secondary)",
                    }}
                  >
                    <Heart className={cn("w-4.5 h-4.5", post.isLiked ? "fill-current" : "")} />
                    <span>{formatNumber(post.likeCount)}</span>
                  </button>

                  <Dropdown
                    trigger={
                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                          post.isFavorited
                            ? "shadow-sm"
                            : "hover:bg-black/5 dark:hover:bg-white/5"
                        )}
                        style={{
                          background: post.isFavorited
                            ? "color-mix(in srgb, var(--app-warning) 15%, transparent)"
                            : "transparent",
                          color: post.isFavorited
                            ? "var(--app-warning)"
                            : "var(--app-text-secondary)",
                        }}
                      >
                        <Bookmark className={cn("w-4.5 h-4.5", post.isFavorited ? "fill-current" : "")} />
                        <span>{formatNumber(post.favoriteCount)}</span>
                      </button>
                    }
                    items={FAVORITE_GROUPS.map<DropdownItem>((g) => ({
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
                      onClick: () => favoritePost(post.id, g.id),
                    }))}
                    placement="bottom-left"
                    menuClassName="min-w-[180px]"
                  />

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ color: "var(--app-text-secondary)" }}
                  >
                    <Share2 className="w-4.5 h-4.5" />
                    分享
                  </button>
                </div>

                {post.authorId !== currentUser.id && (
                  <Dropdown
                    trigger={
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    }
                    items={[
                      {
                        key: "block",
                        label: `屏蔽 ${post.author.nickname}`,
                        icon: <Ban className="w-4 h-4" />,
                        onClick: () =>
                          toggleBlockUser(post.authorId, post.author.nickname),
                      },
                      {
                        key: "report",
                        label: "举报帖子",
                        icon: <Flag className="w-4 h-4" />,
                        danger: true,
                        onClick: () =>
                          setReportTarget({
                            type: "post",
                            id: post.id,
                            name: post.title,
                          }),
                      },
                    ]}
                    placement="bottom-right"
                  />
                )}
              </div>

              <div
                className="flex items-center justify-around mt-5 pt-5 text-xs"
                style={{ borderTop: "1px solid var(--app-border)" }}
              >
                <span className="inline-flex flex-col items-center gap-1" style={{ color: "var(--app-text-tertiary)" }}>
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(post.viewCount)} 浏览</span>
                </span>
                <span className="inline-flex flex-col items-center gap-1" style={{ color: "var(--app-text-tertiary)" }}>
                  <Heart className="w-4 h-4" />
                  <span>{formatNumber(post.likeCount)} 点赞</span>
                </span>
                <span className="inline-flex flex-col items-center gap-1" style={{ color: "var(--app-text-tertiary)" }}>
                  <MessageSquare className="w-4 h-4" />
                  <span>{formatNumber(post.replyCount)} 评论</span>
                </span>
                <span className="inline-flex flex-col items-center gap-1" style={{ color: "var(--app-text-tertiary)" }}>
                  <Bookmark className="w-4 h-4" />
                  <span>{formatNumber(post.favoriteCount)} 收藏</span>
                </span>
              </div>
            </div>
          </article>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 mb-4">
              <h3
                className="text-base font-semibold"
                style={{ color: "var(--app-text-primary)" }}
              >
                全部回复
                <span
                  className="ml-2 text-sm font-normal"
                  style={{ color: "var(--app-text-tertiary)" }}
                >
                  {replies.length} 条
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    background: "var(--app-accent)",
                    color: "#fff",
                  }}
                >
                  最新
                </button>
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: "var(--app-text-secondary)" }}
                >
                  最热
                </button>
              </div>
            </div>

            {replies.length > 0 ? (
              replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  postId={post.id}
                  onReply={(r) => {
                    setReplyTo(r);
                    setReplyContent(`@${r.author.nickname} `);
                  }}
                />
              ))
            ) : (
              <Empty
                type="posts"
                title="还没有回复"
                description="快来抢沙发，发表第一条回复吧！"
              />
            )}
          </div>
        </div>
      </div>

      <div
        className="flex-shrink-0 border-t p-4 vibrant-toolbar"
        style={{ borderTopColor: "var(--app-border)" }}
      >
        <div className="max-w-4xl mx-auto">
          {replyTo && (
            <div
              className="mb-3 p-2.5 rounded-lg flex items-center justify-between text-xs"
              style={{ background: "var(--app-surface-secondary)" }}
            >
              <span style={{ color: "var(--app-text-secondary)" }}>
                回复
                <button
                  type="button"
                  onClick={() => setProfileUserId(replyTo.authorId)}
                  className="mx-1 font-medium"
                  style={{ color: "var(--app-accent)" }}
                >
                  @{replyTo.author.nickname}
                </button>
                的
                <a href={`#floor-${replyTo.floor}`} className="mx-1">
                  #{replyTo.floor} 楼
                </a>
              </span>
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setReplyContent("");
                }}
                className="text-xs px-2 py-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                style={{ color: "var(--app-text-tertiary)" }}
              >
                取消
              </button>
            </div>
          )}

          <div className="relative">
            <div className="flex items-center gap-1 mb-2">
              <button
                type="button"
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--app-text-secondary)" }}
                title="粗体"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--app-text-secondary)" }}
                title="斜体"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--app-text-secondary)" }}
                title="链接"
              >
                <Link className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--app-text-secondary)" }}
                title="图片"
              >
                <Image className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplyContent(replyContent + "@");
                  setShowMentionList(true);
                }}
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--app-text-secondary)" }}
                title="@提及"
              >
                <AtSign className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--app-text-secondary)" }}
                title="表情"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={replyContent}
                  onChange={handleTextareaChange}
                  onFocus={() => {
                    const match = replyContent.match(/@([\u4e00-\u9fa5\w]*)$/);
                    if (match) setShowMentionList(true);
                  }}
                  onBlur={() => setTimeout(() => setShowMentionList(false), 200)}
                  placeholder={replyTo ? `回复 @${replyTo.author.nickname}...` : "写下你的回复... (Enter 发送, Shift+Enter 换行)"}
                  rows={3}
                  className="mac-input resize-none pr-20"
                  style={{ minHeight: "80px" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (replyContent.trim()) {
                        setReplyContent("");
                        setReplyTo(null);
                      }
                    }
                  }}
                />
                <div
                  className="absolute right-3 bottom-3 text-[10px]"
                  style={{ color: "var(--app-text-tertiary)" }}
                >
                  {replyContent.length} / 5000
                </div>

                {showMentionList && matchedUsers.length > 0 && (
                  <div
                    className="absolute bottom-full left-0 mb-2 w-56 rounded-xl shadow-mac-lg overflow-hidden z-10"
                    style={{
                      background: "var(--app-surface)",
                      border: "1px solid var(--app-border)",
                    }}
                  >
                    {matchedUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          insertMention(u.nickname);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ color: "var(--app-text-primary)" }}
                      >
                        <Avatar src={u.avatar} name={u.nickname} size="xs" />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="font-medium truncate text-sm">{u.nickname}</div>
                          <div className="text-[10px] truncate" style={{ color: "var(--app-text-tertiary)" }}>
                            @{u.username}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                size="md"
                rightIcon={<Send className="w-4 h-4" />}
                disabled={!replyContent.trim()}
                onClick={() => {
                  if (replyContent.trim()) {
                    setReplyContent("");
                    setReplyTo(null);
                  }
                }}
                className="h-[80px]"
                style={{ height: "80px" }}
              >
                发送
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

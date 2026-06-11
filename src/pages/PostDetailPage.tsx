import { useState, useMemo, useRef } from "react";
import { useAppStore } from "@/stores/appStore";
import { USERS } from "@/mock";
import Avatar from "@/components/ui/Avatar";
import Tag from "@/components/ui/Tag";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import type { DropdownItem } from "@/components/ui/Dropdown";
import Empty from "@/components/ui/Empty";
import Modal from "@/components/ui/Modal";
import Tooltip from "@/components/ui/Tooltip";
import Tabs from "@/components/ui/Tabs";
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
  Crown as CrownIcon,
  AtSign,
  Smile,
  Plus,
  Trash2,
  Settings,
  Edit3,
  X,
  ChevronDown,
  ChevronUp,
  Pencil,
} from "lucide-react";
import { cn, formatNumber, formatTime, getOSVersionLabel, getMacModelLabel } from "@/lib/utils";
import type { Reply as ReplyType, Post } from "@/types";

type ReplySortType = "latest" | "hot";

function ReplyItem({
  reply,
  postId,
  allReplies,
  currentUserId,
  onReply,
  isHighlighted,
  onFloorClick,
}: {
  reply: ReplyType;
  postId: string;
  allReplies: ReplyType[];
  currentUserId: string;
  onReply: (r: ReplyType) => void;
  isHighlighted?: boolean;
  onFloorClick?: (floor: number) => void;
}) {
  const { toggleBlockUser, setReportTarget, setProfileUserId, updateReply, deleteReply } = useAppStore();
  const [liked, setLiked] = useState(reply.isLiked || false);
  const [likeCount, setLikeCount] = useState(reply.likeCount);
  const [expandedContext, setExpandedContext] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const replyToReply = reply.replyToId
    ? allReplies.find((r) => r.id === reply.replyToId)
    : undefined;

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(likeCount + (liked ? -1 : 1));
  };

  const handleMentionClick = (userId: string) => {
    setProfileUserId(userId);
  };

  const toggleContext = (replyId: string) => {
    setExpandedContext((prev) => ({ ...prev, [replyId]: !prev[replyId] }));
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    updateReply(postId, reply.id, { content: editContent.trim() });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(reply.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteReply(postId, reply.id);
    setShowDeleteConfirm(false);
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

  const isOwnReply = reply.authorId === currentUserId;
  const isContextExpanded = expandedContext[reply.id] || false;

  const dropdownItems: DropdownItem[] = [
    {
      key: "reply",
      label: "回复引用",
      icon: <Reply className="w-4 h-4" />,
      onClick: () => onReply(reply),
    },
  ];

  if (isOwnReply && !reply.isDeleted) {
    dropdownItems.push(
      { key: "div1", label: "", divider: true } as DropdownItem,
      {
        key: "edit",
        label: "编辑",
        icon: <Edit3 className="w-4 h-4" />,
        onClick: () => setIsEditing(true),
      },
      {
        key: "delete",
        label: "撤回",
        icon: <Trash2 className="w-4 h-4" />,
        danger: true,
        onClick: () => setShowDeleteConfirm(true),
      }
    );
  }

  if (!isOwnReply) {
    dropdownItems.push(
      { key: "div2", label: "", divider: true } as DropdownItem,
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
      }
    );
  }

  if (reply.isDeleted) {
    return (
      <div
        id={`floor-${reply.floor}`}
        className={cn(
          "scroll-mt-20 rounded-xl p-5 transition-all"
        )}
        style={{
          background: "var(--app-surface)",
          border: `1px solid var(--app-border)`,
          opacity: 0.6,
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Avatar
              src={reply.author.avatar}
              name={reply.author.nickname}
              size="md"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--app-text-tertiary)" }}
                >
                  {reply.author.nickname}
                </span>
                <span
                  className="text-xs flex items-center gap-1"
                  style={{ color: "var(--app-text-tertiary)" }}
                >
                  {formatTime(reply.createdAt)}
                </span>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-md"
                style={{ color: "var(--app-text-tertiary)" }}
              >
                #{reply.floor} 楼
              </span>
            </div>
            <p
              className="text-sm italic"
              style={{ color: "var(--app-text-tertiary)" }}
            >
              该回复已被撤回
              {reply.deletedAt && (
                <Tooltip content={`撤回于 ${formatTime(reply.deletedAt)}`}>
                  <span className="ml-1">· {formatTime(reply.deletedAt)}</span>
                </Tooltip>
              )}
            </p>
          </div>
        </div>

        <Modal
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="确认撤回回复"
          footer={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
              >
                确认撤回
              </Button>
            </>
          }
        >
          <p className="text-sm" style={{ color: "var(--app-text-secondary)" }}>
            撤回后该回复将对所有人隐藏，且无法恢复。确定要撤回吗？
          </p>
        </Modal>
      </div>
    );
  }

  return (
    <div
      id={`floor-${reply.floor}`}
      className={cn(
        "scroll-mt-20 rounded-xl p-5 transition-all group",
        isHighlighted && "ring-2 ring-[var(--app-accent)] animate-pulse"
      )}
      style={{
        background: "var(--app-surface)",
        border: `1px solid ${isHighlighted ? "var(--app-accent)" : "var(--app-border)"}`,
        boxShadow: isHighlighted ? "0 0 0 3px color-mix(in srgb, var(--app-accent) 20%, transparent)" : "none",
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
              {reply.isEdited && (
                <Tooltip content={reply.editedAt ? `编辑于 ${formatTime(reply.editedAt)}` : "已编辑"}>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--app-surface-secondary)",
                      color: "var(--app-text-tertiary)",
                    }}
                  >
                    已编辑
                  </span>
                </Tooltip>
              )}
              <span
                className="text-xs flex items-center gap-1"
                style={{ color: "var(--app-text-tertiary)" }}
              >
                {formatTime(reply.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => onFloorClick?.(reply.floor)}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--app-text-tertiary)" }}
                title={`跳转到 #${reply.floor} 楼`}
              >
                #{reply.floor} 楼
              </button>

              <Dropdown
                trigger={
                  <Button variant="icon" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                }
                items={dropdownItems}
                placement="bottom-right"
              />
            </div>
          </div>

          {reply.replyToFloor && reply.replyToAuthor && (
            <div className="mb-3">
              <div
                className="p-3 rounded-lg text-sm cursor-pointer transition-colors hover:opacity-90"
                style={{
                  background: "var(--app-surface-secondary)",
                  borderLeft: "3px solid var(--app-accent)",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => {
                      if (replyToReply) {
                        onFloorClick?.(reply.replyToFloor!);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs"
                        style={{ color: "var(--app-text-secondary)" }}
                      >
                        回复
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfileUserId(reply.replyToAuthor!.id);
                        }}
                        className="text-xs font-medium transition-opacity hover:opacity-80"
                        style={{ color: "var(--app-accent)" }}
                      >
                        @{reply.replyToAuthor.nickname}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (replyToReply) {
                            onFloorClick?.(reply.replyToFloor!);
                          }
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--app-border)",
                          color: replyToReply ? "var(--app-text-secondary)" : "var(--app-text-tertiary)",
                          cursor: replyToReply ? "pointer" : "default",
                        }}
                        disabled={!replyToReply}
                      >
                        #{reply.replyToFloor}
                      </button>
                    </div>
                    {replyToReply ? (
                      <p
                        className="text-xs line-clamp-1"
                        style={{ color: "var(--app-text-secondary)" }}
                      >
                        {replyToReply.content.length > 80
                          ? replyToReply.content.slice(0, 80) + "..."
                          : replyToReply.content}
                      </p>
                    ) : (
                      <p
                        className="text-xs"
                        style={{ color: "var(--app-text-tertiary)" }}
                      >
                        该回复可能已被删除
                      </p>
                    )}
                  </div>
                  {replyToReply && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleContext(reply.id);
                      }}
                      className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ color: "var(--app-text-secondary)" }}
                    >
                      {isContextExpanded ? (
                        <>
                          收起上下文
                          <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          展开上下文
                          <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isContextExpanded && replyToReply && (
                <div
                  className="mt-2 ml-4 p-3 rounded-lg text-sm"
                  style={{
                    background: "var(--app-surface-secondary)",
                    border: "1px solid var(--app-border)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setProfileUserId(replyToReply.authorId)}
                      className="text-xs font-semibold transition-opacity hover:opacity-80"
                      style={{ color: "var(--app-text-primary)" }}
                    >
                      {replyToReply.author.nickname}
                    </button>
                    <Badge variant="primary" size="sm">
                      Lv.{replyToReply.author.level}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => onFloorClick?.(replyToReply.floor)}
                      className="text-[10px] px-1.5 py-0.5 rounded ml-auto"
                      style={{
                        background: "var(--app-border)",
                        color: "var(--app-text-secondary)",
                      }}
                    >
                      #{replyToReply.floor}
                    </button>
                  </div>
                  <div
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--app-text-secondary)" }}
                  >
                    {renderContent(replyToReply.content)}
                  </div>
                  <div
                    className="mt-2 text-[10px]"
                    style={{ color: "var(--app-text-tertiary)" }}
                  >
                    {formatTime(replyToReply.createdAt)}
                  </div>
                </div>
              )}
            </div>
          )}

          {isEditing ? (
            <div className="mb-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="mac-input resize-none w-full"
                style={{ minHeight: "100px" }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleCancelEdit();
                  }
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <span
                  className="text-[10px]"
                  style={{ color: "var(--app-text-tertiary)" }}
                >
                  {editContent.length} / 5000
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<X className="w-3.5 h-3.5" />}
                    onClick={handleCancelEdit}
                  >
                    取消
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim() || editContent === reply.content}
                  >
                    保存
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="text-sm leading-relaxed mb-3 prose prose-sm max-w-none"
              style={{ color: "var(--app-text-primary)" }}
            >
              {renderContent(reply.content)}
            </div>
          )}

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

      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="确认撤回回复"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              取消
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
            >
              确认撤回
            </Button>
          </>
        }
      >
        <p className="text-sm" style={{ color: "var(--app-text-secondary)" }}>
          撤回后该回复将对所有人隐藏，且无法恢复。确定要撤回吗？
        </p>
      </Modal>
    </div>
  );
}

export default function PostDetailPage() {
  const {
    activePostId,
    setActivePost,
    likePost,
    setFeedFilter,
    setProfileUserId,
    setReportTarget,
    toggleBlockUser,
    currentUser,
    getRepliesByPostId,
    getFilteredReplies,
    getPostById,
    isPostFavorited,
    getPostFavoriteGroups,
    toggleFavoriteInGroup,
    unfavoritePost,
    createFavoriteGroup,
    favoriteGroups,
    favoriteItems,
    addReply,
    getBlockedUserIds,
    setActivePanel,
    setFavoriteItemRemark,
  } = useAppStore();

  const post: Post | undefined = useMemo(
    () => getPostById(activePostId || ""),
    [activePostId, getPostById]
  );

  const allReplies = useMemo(
    () => getRepliesByPostId(post?.id || ""),
    [post?.id, getRepliesByPostId]
  );

  const [replySort, setReplySort] = useState<ReplySortType>("latest");

  const sortedReplies = useMemo(() => {
    const filtered = getFilteredReplies(allReplies);
    const sorted = [...filtered];
    if (replySort === "latest") {
      sorted.sort((a, b) => b.floor - a.floor);
    } else {
      sorted.sort((a, b) => b.likeCount - a.likeCount);
    }
    return sorted;
  }, [allReplies, getFilteredReplies, replySort]);

  const replies = sortedReplies;

  const favorited = post ? isPostFavorited(post.id) : false;
  const postFavGroups = post ? getPostFavoriteGroups(post.id) : [];

  const [replyTo, setReplyTo] = useState<ReplyType | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [highlightedFloor, setHighlightedFloor] = useState<number | null>(null);
  const [showBlockedPost, setShowBlockedPost] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [editingRemarkItemId, setEditingRemarkItemId] = useState<string | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const repliesEndRef = useRef<HTMLDivElement>(null);

  const isAuthorBlocked = post ? getBlockedUserIds().includes(post.authorId) : false;

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

  const handleFloorClick = (floor: number) => {
    const el = document.getElementById(`floor-${floor}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightedFloor(floor);
      setTimeout(() => setHighlightedFloor(null), 2000);
    }
  };

  const handleSendReply = () => {
    if (!post || !replyContent.trim()) return;

    addReply(post.id, {
      content: replyContent.trim(),
      replyToId: replyTo?.id,
      replyToFloor: replyTo?.floor,
      replyToAuthor: replyTo?.author,
    });

    setReplyContent("");
    setReplyTo(null);

    setTimeout(() => {
      repliesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    createFavoriteGroup(newGroupName.trim());
    setNewGroupName("");
    setShowNewGroupModal(false);
  };

  const handleOpenRemarkModal = (itemId: string, currentRemark?: string) => {
    setEditingRemarkItemId(itemId);
    setRemarkText(currentRemark || "");
    setShowRemarkModal(true);
  };

  const handleSaveRemark = () => {
    if (!editingRemarkItemId) return;
    setFavoriteItemRemark(editingRemarkItemId, remarkText.trim());
    setShowRemarkModal(false);
    setEditingRemarkItemId(null);
    setRemarkText("");
  };

  const getPostFavoriteItems = (postId: string) => {
    return favoriteItems.filter((fi) => fi.targetId === postId);
  };

  if (!post) {
    return (
      <div className="h-full flex items-center justify-center">
        <Empty type="posts" />
      </div>
    );
  }

  const sortTabs = [
    { key: "latest", label: "最新" },
    { key: "hot", label: "最热" },
  ];

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
            className="rounded-2xl p-6 mb-6 relative overflow-hidden"
            style={{
              background: "var(--app-surface)",
              border: `1px solid ${
                post.isPinned
                  ? "color-mix(in srgb, var(--app-warning) 30%, transparent)"
                  : "var(--app-border)"
              }`,
            }}
          >
            {isAuthorBlocked && !showBlockedPost && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-md bg-[var(--app-surface)]/80">
                <Ban className="w-10 h-10 mb-3" style={{ color: "var(--app-text-tertiary)" }} />
                <p className="text-sm font-medium mb-2" style={{ color: "var(--app-text-primary)" }}>
                  该用户已被屏蔽
                </p>
                <p className="text-xs mb-4" style={{ color: "var(--app-text-tertiary)" }}>
                  你已屏蔽 {post.author.nickname}，内容已隐藏
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowBlockedPost(true)}
                >
                  查看内容
                </Button>
              </div>
            )}

            <div className={cn(isAuthorBlocked && !showBlockedPost && "opacity-30 pointer-events-none select-none")}>
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
                          favorited
                            ? "shadow-sm"
                            : "hover:bg-black/5 dark:hover:bg-white/5"
                        )}
                        style={{
                          background: favorited
                            ? "color-mix(in srgb, var(--app-warning) 15%, transparent)"
                            : "transparent",
                          color: favorited
                            ? "var(--app-warning)"
                            : "var(--app-text-secondary)",
                        }}
                      >
                        <Bookmark className={cn("w-4.5 h-4.5", favorited ? "fill-current" : "")} />
                        <span>{formatNumber(post.favoriteCount)}</span>
                      </button>
                    }
                    items={[
                      ...(favorited
                        ? [
                            {
                              key: "remove-all",
                              label: (
                                <span className="flex items-center gap-2">
                                  <Trash2 className="w-4 h-4" />
                                  <span>从所有分组移除</span>
                                </span>
                              ),
                              danger: true,
                              onClick: () => unfavoritePost(post.id),
                            } as DropdownItem,
                            {
                              key: "manage",
                              label: (
                                <span className="flex items-center gap-2">
                                  <Settings className="w-4 h-4" />
                                  <span>管理分组</span>
                                </span>
                              ),
                              onClick: () => setActivePanel("favorites"),
                            } as DropdownItem,
                            { key: "div1", label: "", divider: true } as DropdownItem,
                          ]
                        : []),
                      ...favoriteGroups.map<DropdownItem>((g) => {
                        const favItem = getPostFavoriteItems(post.id).find((fi) => fi.groupId === g.id);
                        const hasRemark = !!favItem?.remark;
                        return {
                          key: g.id,
                          label: (
                            <span className="flex items-center gap-2 w-full">
                              <span
                                className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                                style={{
                                  borderColor: postFavGroups.includes(g.id) ? g.color : "var(--app-border)",
                                  background: postFavGroups.includes(g.id) ? g.color : "transparent",
                                }}
                              >
                                {postFavGroups.includes(g.id) && (
                                  <span className="text-white text-[10px]">✓</span>
                                )}
                              </span>
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ background: g.color }}
                              />
                              <span className="flex-1 min-w-0 truncate">{g.name}</span>
                              {hasRemark && postFavGroups.includes(g.id) && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (favItem) {
                                      handleOpenRemarkModal(favItem.id, favItem.remark);
                                    }
                                  }}
                                  className="w-5 h-5 rounded flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5 flex-shrink-0"
                                  style={{ color: "var(--app-text-secondary)" }}
                                  title={favItem?.remark || "编辑备注"}
                                >
                                  <MessageSquare className="w-3 h-3" />
                                </button>
                              )}
                              <span className="text-[10px] flex-shrink-0" style={{ color: "var(--app-text-tertiary)" }}>
                                {g.itemCount}
                              </span>
                            </span>
                          ),
                          onClick: () => toggleFavoriteInGroup(post.id, g.id),
                        };
                      }),
                      { key: "div2", label: "", divider: true } as DropdownItem,
                      {
                        key: "new-group",
                        label: (
                          <span className="flex items-center gap-2" style={{ color: "var(--app-accent)" }}>
                            <Plus className="w-4 h-4" />
                            <span>新建分组</span>
                          </span>
                        ),
                        onClick: () => setShowNewGroupModal(true),
                      },
                    ]}
                    placement="bottom-left"
                    menuClassName="min-w-[220px]"
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

              {favorited && postFavGroups.length > 0 && (
                <div
                  className="mt-4 pt-4 text-xs"
                  style={{ borderTop: "1px solid var(--app-border)" }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ color: "var(--app-text-tertiary)" }}>
                        已收藏到 {postFavGroups.length} 个分组：
                      </span>
                      {favoriteGroups
                        .filter((g) => postFavGroups.includes(g.id))
                        .map((g) => {
                          const favItem = getPostFavoriteItems(post.id).find((fi) => fi.groupId === g.id);
                          return (
                            <span
                              key={g.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
                              style={{
                                background: `${g.color}15`,
                                color: g.color,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: g.color }}
                              />
                              {g.name}
                              {favItem?.remark && (
                                <MessageSquare className="w-2.5 h-2.5 ml-0.5" />
                              )}
                            </span>
                          );
                        })}
                    </div>
                    {getPostFavoriteItems(post.id).some((fi) => fi.remark) && (
                      <div className="space-y-1.5">
                        {getPostFavoriteItems(post.id)
                          .filter((fi) => fi.remark)
                          .map((fi) => {
                            const g = favoriteGroups.find((group) => group.id === fi.groupId);
                            return (
                              <div
                                key={fi.id}
                                className="flex items-start gap-2 p-2 rounded-lg"
                                style={{
                                  background: "var(--app-surface-secondary)",
                                }}
                              >
                                <span
                                  className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                                  style={{ background: g?.color || "#007AFF" }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span
                                      className="text-[11px] font-medium"
                                      style={{ color: g?.color || "var(--app-text-primary)" }}
                                    >
                                      {g?.name || "未分组"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenRemarkModal(fi.id, fi.remark)}
                                      className="w-4 h-4 rounded flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                      style={{ color: "var(--app-text-secondary)" }}
                                      title="编辑备注"
                                    >
                                      <Pencil className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                  <p
                                    className="text-[11px] italic line-clamp-2"
                                    style={{ color: "var(--app-text-secondary)" }}
                                  >
                                    {fi.remark}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
              <Tabs
                items={sortTabs}
                activeKey={replySort}
                onChange={(key) => setReplySort(key as ReplySortType)}
                variant="pills"
                size="sm"
              />
            </div>

            {replies.length > 0 ? (
              replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  postId={post.id}
                  allReplies={allReplies}
                  currentUserId={currentUser.id}
                  onReply={(r) => {
                    setReplyTo(r);
                    setReplyContent(`@${r.author.nickname} `);
                  }}
                  isHighlighted={highlightedFloor === reply.floor}
                  onFloorClick={handleFloorClick}
                />
              ))
            ) : (
              <Empty
                type="posts"
                title="还没有回复"
                description="快来抢沙发，发表第一条回复吧！"
              />
            )}
            <div ref={repliesEndRef} />
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
                <button
                  type="button"
                  onClick={() => handleFloorClick(replyTo.floor)}
                  className="mx-1 font-medium underline underline-offset-2"
                  style={{ color: "var(--app-accent)" }}
                >
                  #{replyTo.floor} 楼
                </button>
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
                        handleSendReply();
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
                onClick={handleSendReply}
                className="h-[80px]"
                style={{ height: "80px" }}
              >
                发送
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showNewGroupModal}
        onClose={() => {
          setShowNewGroupModal(false);
          setNewGroupName("");
        }}
        title="新建收藏分组"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowNewGroupModal(false);
                setNewGroupName("");
              }}
            >
              取消
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
            >
              创建
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="text-sm" style={{ color: "var(--app-text-secondary)" }}>
            分组名称
          </label>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="输入分组名称"
            className="mac-input w-full"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && newGroupName.trim()) {
                handleCreateGroup();
              }
            }}
          />
        </div>
      </Modal>

      <Modal
        open={showRemarkModal}
        onClose={() => {
          setShowRemarkModal(false);
          setEditingRemarkItemId(null);
          setRemarkText("");
        }}
        title={
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" style={{ color: "var(--app-accent)" }} />
            编辑备注
          </div>
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowRemarkModal(false);
                setEditingRemarkItemId(null);
                setRemarkText("");
              }}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveRemark}
              leftIcon={<Pencil className="w-4 h-4" />}
            >
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium" style={{ color: "var(--app-text-primary)" }}>
            备注内容
          </label>
          <textarea
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            placeholder="添加备注，方便日后查找..."
            rows={4}
            className="mac-input resize-none"
            autoFocus
            maxLength={500}
          />
          <div className="text-right text-[10px]" style={{ color: "var(--app-text-tertiary)" }}>
            {remarkText.length} / 500
          </div>
        </div>
      </Modal>
    </div>
  );
}

import { useState, useMemo } from "react";
import { useAppStore } from "@/stores/appStore";
import { FAVORITE_GROUPS as MOCK_GROUPS, FAVORITE_ITEMS as MOCK_ITEMS, POSTS, REPLIES } from "@/mock";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Dropdown, { type DropdownItem } from "@/components/ui/Dropdown";
import Empty from "@/components/ui/Empty";
import Modal from "@/components/ui/Modal";
import Tag from "@/components/ui/Tag";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowUpDown,
  Clock,
  Flame,
  Type,
  CheckSquare,
  Square,
  FileText,
  MessageSquare,
  FolderPlus,
  MoreHorizontal,
  FolderOpen,
  X,
  ChevronRight,
  Move,
  ExternalLink,
  Heart,
} from "lucide-react";
import { cn, formatTime, formatNumber } from "@/lib/utils";
import type { FavoriteItem, Post, Reply } from "@/types";

const SORT_OPTIONS = [
  { key: "added", label: "收藏时间", icon: Clock },
  { key: "hot", label: "内容热度", icon: Flame },
  { key: "alpha", label: "字母序", icon: Type },
];

const GROUP_COLORS = ["#007AFF", "#FF9500", "#FF2D55", "#34C759", "#AF52DE", "#30B0C7", "#5856D6"];

export default function FavoritesPage() {
  const {
    favoriteGroups: storeGroups,
    favoriteItems: storeItems,
    activeFavoriteGroupId,
    setActiveFavoriteGroup,
    createFavoriteGroup,
    deleteFavoriteGroup,
    renameFavoriteGroup,
    removeFavoriteItem,
    moveFavoriteItem,
    setActivePost,
    getPostFavoriteGroups,
    toggleFavoriteInGroup,
  } = useAppStore();

  const groups = storeGroups.length > 0 ? storeGroups : MOCK_GROUPS;
  const items = storeItems.length > 0 ? storeItems : MOCK_ITEMS;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("added");
  const [batchMode, setBatchMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[0]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetGroup, setMoveTargetGroup] = useState("");
  const [movingItemIds, setMovingItemIds] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);
  const [showGroupManageModal, setShowGroupManageModal] = useState(false);
  const [managePostId, setManagePostId] = useState<string>("");

  const activeGroup = groups.find((g) => g.id === activeFavoriteGroupId);
  const activeGroupItems = useMemo(() => {
    let result =
      activeFavoriteGroupId === "fg1"
        ? items
        : items.filter((i) => i.groupId === activeFavoriteGroupId);

    if (searchQuery) {
      const kw = searchQuery.toLowerCase();
      result = result.filter((i) => {
        const target = i.target as Post | undefined;
        return (
          target?.title?.toLowerCase().includes(kw) ||
          target?.author?.nickname?.toLowerCase().includes(kw)
        );
      });
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "added") {
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
      if (sortBy === "hot") {
        const ta = (a.target as Post)?.likeCount || 0;
        const tb = (b.target as Post)?.likeCount || 0;
        return tb - ta;
      }
      const ta = (a.target as Post)?.title || "";
      const tb = (b.target as Post)?.title || "";
      return ta.localeCompare(tb);
    });

    return result;
  }, [items, activeFavoriteGroupId, searchQuery, sortBy]);

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedItems.size === activeGroupItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(activeGroupItems.map((i) => i.id)));
    }
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    createFavoriteGroup(newGroupName.trim(), newGroupColor);
    setNewGroupName("");
    setNewGroupColor(GROUP_COLORS[0]);
    setShowCreateModal(false);
  };

  const handleRename = () => {
    if (!editingGroup || !editName.trim()) return;
    renameFavoriteGroup(editingGroup, editName.trim());
    setEditingGroup(null);
    setEditName("");
  };

  const handleMove = () => {
    if (!moveTargetGroup) return;
    movingItemIds.forEach((id) => moveFavoriteItem(id, moveTargetGroup));
    setShowMoveModal(false);
    setMovingItemIds([]);
    setMoveTargetGroup("");
    if (batchMode) setSelectedItems(new Set());
  };

  const handleBatchDelete = () => {
    selectedItems.forEach((id) => removeFavoriteItem(id));
    setSelectedItems(new Set());
    setBatchMode(false);
  };

  return (
    <div className="h-full flex overflow-hidden app-transition" style={{ background: "var(--app-bg)" }}>
      <aside
        className="w-60 flex-shrink-0 border-r flex flex-col h-full"
        style={{
          borderRightColor: "var(--app-border)",
          background: "var(--app-surface)",
        }}
      >
        <div className="flex-shrink-0 p-3 border-b" style={{ borderBottomColor: "var(--app-border)" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold" style={{ color: "var(--app-text-primary)" }}>
              收藏夹
            </h2>
            <Button
              variant="primary"
              size="xs"
              leftIcon={<Plus className="w-3 h-3" />}
              onClick={() => setShowCreateModal(true)}
            >
              新建
            </Button>
          </div>
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: "var(--app-text-tertiary)" }}
            />
            <input
              type="text"
              placeholder="搜索分组..."
              className="mac-input pl-8 text-xs h-8 !py-1"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-0.5">
          {groups
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((g) => {
              const isActive = g.id === activeFavoriteGroupId;
              const isEditing = editingGroup === g.id;
              const isFG1 = g.id === "fg1";
              const isDragOver = dragOverGroup === g.id && draggedItem;

              return (
                <div
                  key={g.id}
                  className={cn(
                    "group relative rounded-lg transition-all",
                    isDragOver && "ring-2 ring-[var(--app-accent)]"
                  )}
                  onDragOver={(e) => {
                    if (draggedItem) {
                      e.preventDefault();
                      setDragOverGroup(g.id);
                    }
                  }}
                  onDragLeave={() => setDragOverGroup(null)}
                  onDrop={() => {
                    if (draggedItem && !isFG1) {
                      moveFavoriteItem(draggedItem, g.id);
                    }
                    setDraggedItem(null);
                    setDragOverGroup(null);
                  }}
                >
                  {isEditing ? (
                    <div className="p-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename();
                          if (e.key === "Escape") setEditingGroup(null);
                        }}
                        autoFocus
                        className="mac-input text-xs h-7 !py-1"
                        style={{ paddingLeft: "28px" }}
                      />
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                        style={{ background: g.color }}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveFavoriteGroup(g.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all relative",
                        isActive
                          ? "font-medium shadow-sm"
                          : "hover:bg-black/5 dark:hover:bg-white/5"
                      )}
                      style={{
                        background: isActive ? "var(--app-accent)" : "transparent",
                        color: isActive ? "#fff" : "var(--app-text-secondary)",
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          background: isActive ? "rgba(255,255,255,0.9)" : g.color,
                          boxShadow: isActive
                            ? "0 0 0 2px rgba(255,255,255,0.3)"
                            : "none",
                        }}
                      />
                      <span
                        className={cn(
                          "flex-1 text-left truncate",
                          draggedItem && isFG1 ? "" : ""
                        )}
                      >
                        {g.name}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: isActive
                            ? "rgba(255,255,255,0.25)"
                            : "var(--app-surface-secondary)",
                          color: isActive
                            ? "#fff"
                            : "var(--app-text-tertiary)",
                        }}
                      >
                        {g.itemCount}
                      </span>

                      <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-[var(--app-surface)] rounded-md shadow-sm p-0.5 z-10">
                        {!isFG1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingGroup(g.id);
                              setEditName(g.name);
                            }}
                            className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ color: "var(--app-text-secondary)" }}
                            title="重命名"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                        {!isFG1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`确定删除分组"${g.name}"吗？`)) {
                                deleteFavoriteGroup(g.id);
                              }
                            }}
                            className={cn(
                              "w-6 h-6 rounded flex items-center justify-center transition-colors",
                              "hover:bg-[var(--app-danger)]/10"
                            )}
                            style={{ color: isFG1 ? "var(--app-text-tertiary)" : "var(--app-danger)" }}
                            disabled={isFG1}
                            title={isFG1 ? "默认分组不可删除" : "删除分组"}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <div
          className="flex-shrink-0 border-b vibrant-toolbar px-5 py-4"
          style={{ borderBottomColor: "var(--app-border)" }}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <FolderOpen
                className="w-5 h-5 flex-shrink-0"
                style={{ color: "var(--app-accent)" }}
              />
              <h1
                className="text-lg font-bold truncate"
                style={{ color: "var(--app-text-primary)" }}
              >
                {activeGroup?.name || "收藏夹"}
              </h1>
              {activeGroup?.description && (
                <>
                  <ChevronRight
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "var(--app-text-tertiary)" }}
                  />
                  <span
                    className="text-sm truncate"
                    style={{ color: "var(--app-text-secondary)" }}
                  >
                    {activeGroup.description}
                  </span>
                </>
              )}
              <Badge variant="gray" size="sm" count={activeGroupItems.length} className="ml-1" />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--app-text-tertiary)" }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索收藏内容..."
                  className="mac-input pl-9 text-sm h-9 !py-1.5 w-56"
                />
              </div>

              <Dropdown
                trigger={
                  <Button variant="secondary" size="sm" rightIcon={<ArrowUpDown className="w-3.5 h-3.5" />}>
                    {SORT_OPTIONS.find((o) => o.key === sortBy)?.label}
                  </Button>
                }
                items={SORT_OPTIONS.map<DropdownItem>((opt) => {
                  const Icon = opt.icon;
                  return {
                    key: opt.key,
                    label: (
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {opt.label}
                        {sortBy === opt.key && <CheckSquare className="w-4 h-4 ml-auto" style={{ color: "var(--app-accent)" }} />}
                      </span>
                    ),
                    onClick: () => setSortBy(opt.key),
                  };
                })}
                placement="bottom-right"
              />

              <Button
                variant={batchMode ? "primary" : "secondary"}
                size="sm"
                leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
                onClick={() => {
                  setBatchMode(!batchMode);
                  if (batchMode) setSelectedItems(new Set());
                }}
              >
                {batchMode ? "取消选择" : "批量选择"}
              </Button>
            </div>
          </div>

          {batchMode && (
            <div
              className="flex items-center justify-between px-4 py-2.5 rounded-xl"
              style={{
                background: "var(--app-surface-secondary)",
                border: "1px solid var(--app-border)",
              }}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={selectAll}
                  className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
                  style={{ color: "var(--app-text-secondary)" }}
                >
                  {selectedItems.size === activeGroupItems.length && activeGroupItems.length > 0 ? (
                    <CheckSquare className="w-4 h-4" style={{ color: "var(--app-accent)" }} />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  全选
                </button>
                <span
                  className="text-xs"
                  style={{ color: "var(--app-text-tertiary)" }}
                >
                  已选 {selectedItems.size} / {activeGroupItems.length} 项
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={selectedItems.size === 0}
                  leftIcon={<Move className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setMovingItemIds([...selectedItems]);
                    setShowMoveModal(true);
                  }}
                >
                  移动到分组
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={selectedItems.size === 0}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={handleBatchDelete}
                >
                  删除
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          {activeGroupItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeGroupItems.map((item) => {
                const post = item.target as Post | undefined;
                const reply = item.targetType === "reply" ? (item.target as Reply) : null;
                const isSelected = selectedItems.has(item.id);
                const targetGroup = groups.find((g) => g.id === item.groupId);

                return (
                  <div
                    key={item.id}
                    draggable={!batchMode}
                    onDragStart={() => setDraggedItem(item.id)}
                    onDragEnd={() => setDraggedItem(null)}
                    className={cn(
                      "rounded-xl p-4 transition-all relative group cursor-pointer",
                      draggedItem === item.id && "opacity-50 scale-95",
                      "hover:shadow-md"
                    )}
                    style={{
                      background: "var(--app-surface)",
                      border: `1px solid ${
                        isSelected
                          ? "var(--app-accent)"
                          : "var(--app-border)"
                      }`,
                      boxShadow: isSelected ? "0 0 0 2px var(--app-accent)/20" : "none",
                    }}
                    onClick={() => {
                      if (batchMode) {
                        toggleSelect(item.id);
                      } else if (item.targetType === "post" && post) {
                        setActivePost(post.id);
                      }
                    }}
                  >
                    {batchMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(item.id);
                        }}
                        className="absolute top-3 left-3 z-10"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5" style={{ color: "var(--app-accent)" }} />
                        ) : (
                          <Square
                            className="w-5 h-5"
                            style={{
                              color: "var(--app-surface)",
                              WebkitTextStroke: "1px var(--app-border-strong)",
                            }}
                          />
                        )}
                      </button>
                    )}

                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          batchMode && "pl-8"
                        )}
                        style={{
                          background:
                            item.targetType === "post"
                              ? "color-mix(in srgb, var(--app-accent) 15%, transparent)"
                              : "color-mix(in srgb, var(--app-success) 15%, transparent)",
                        }}
                      >
                        {item.targetType === "post" ? (
                          <FileText className="w-5 h-5" style={{ color: "var(--app-accent)" }} />
                        ) : (
                          <MessageSquare className="w-5 h-5" style={{ color: "var(--app-success)" }} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {targetGroup && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: `${targetGroup.color}15`,
                                  color: targetGroup.color,
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: targetGroup.color }} />
                                {targetGroup.name}
                              </span>
                            )}
                            {item.targetType === "reply" && (
                              <Badge variant="success" size="sm">
                                回复
                              </Badge>
                            )}
                          </div>

                          <Dropdown
                            trigger={
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="w-7 h-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5 dark:hover:bg-white/5"
                                style={{ color: "var(--app-text-secondary)" }}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            }
                            items={[
                              {
                                key: "move",
                                label: "移动到分组",
                                icon: <Move className="w-4 h-4" />,
                                onClick: () => {
                                  setMovingItemIds([item.id]);
                                  setShowMoveModal(true);
                                },
                              },
                              {
                                key: "open",
                                label: "打开原帖",
                                icon: <ExternalLink className="w-4 h-4" />,
                                onClick: () => post && setActivePost(post.id),
                              },
                              { key: "divider1", label: "", divider: true },
                              {
                                key: "remove",
                                label: "移除收藏",
                                icon: <Trash2 className="w-4 h-4" />,
                                danger: true,
                                onClick: () => removeFavoriteItem(item.id),
                              },
                            ] as DropdownItem[]}
                            placement="bottom-right"
                          />
                        </div>

                        <h3
                          className="text-sm font-semibold line-clamp-2 mb-1.5"
                          style={{ color: "var(--app-text-primary)" }}
                        >
                          {reply
                            ? `回复: ${(REPLIES[reply.postId]?.[0]?.content || "").slice(0, 30)}...`
                            : post?.title || "(无标题)"}
                        </h3>

                        <p
                          className="text-xs line-clamp-2 mb-3"
                          style={{ color: "var(--app-text-secondary)" }}
                        >
                          {post?.content
                            ?.replace(/[#*`\[\]()>-]/g, "")
                            .slice(0, 80) || reply?.content?.slice(0, 80)}
                          ...
                        </p>
                      </div>
                    </div>

                    <div
                      className="pt-3 flex items-center justify-between"
                      style={{ borderTop: "1px solid var(--app-border)" }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar
                          src={post?.author?.avatar || reply?.author?.avatar}
                          name={post?.author?.nickname || reply?.author?.nickname}
                          size="xs"
                        />
                        <span
                          className="text-xs truncate"
                          style={{ color: "var(--app-text-secondary)" }}
                        >
                          {post?.author?.nickname || reply?.author?.nickname}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] flex-shrink-0" style={{ color: "var(--app-text-tertiary)" }}>
                        <span className="inline-flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTime(item.addedAt).replace("前", "")}
                        </span>
                        {post && (
                          <span className="inline-flex items-center gap-0.5">
                            <Heart className="w-2.5 h-2.5" />
                            {formatNumber(post.likeCount)}
                          </span>
                        )}
                      </div>
                    </div>

                    {post && (
                      <div
                        className="mt-3 pt-3 flex items-center justify-between"
                        style={{ borderTop: "1px solid var(--app-border)" }}
                      >
                        <span
                          className="text-[11px]"
                          style={{ color: "var(--app-text-tertiary)" }}
                        >
                          已收藏到 {getPostFavoriteGroups(post.id).length} 个分组
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setManagePostId(post.id);
                            setShowGroupManageModal(true);
                          }}
                          className="text-[11px] px-2 py-1 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                          style={{ color: "var(--app-accent)" }}
                        >
                          管理分组
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : searchQuery ? (
            <Empty type="search" />
          ) : (
            <Empty
              type="favorites"
              actionLabel={activeFavoriteGroupId === "fg1" ? "去发现内容" : undefined}
            />
          )}
        </div>
      </div>

      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewGroupName("");
          setNewGroupColor(GROUP_COLORS[0]);
        }}
        title={
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5" style={{ color: "var(--app-accent)" }} />
            新建分组
          </div>
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setNewGroupName("");
                setNewGroupColor(GROUP_COLORS[0]);
              }}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              创建
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--app-text-primary)" }}>
              分组名称
            </label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="例如：开发教程"
              className="mac-input"
              maxLength={20}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--app-text-primary)" }}>
              选择颜色
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {GROUP_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewGroupColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    newGroupColor === c ? "ring-2 ring-offset-2 scale-110" : "hover:scale-105"
                  )}
                  style={{
                    background: c,
                    boxShadow:
                      newGroupColor === c ? `0 0 0 2px ${c}40` : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={showMoveModal}
        onClose={() => {
          setShowMoveModal(false);
          setMovingItemIds([]);
          setMoveTargetGroup("");
        }}
        title={
          <div className="flex items-center gap-2">
            <Move className="w-5 h-5" style={{ color: "var(--app-accent)" }} />
            移动到分组
          </div>
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowMoveModal(false);
                setMovingItemIds([]);
                setMoveTargetGroup("");
              }}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleMove}
              disabled={!moveTargetGroup}
              leftIcon={<Move className="w-4 h-4" />}
            >
              移动 {movingItemIds.length > 1 ? `(${movingItemIds.length} 项)` : ""}
            </Button>
          </>
        }
      >
        <div className="space-y-1.5 max-h-64 overflow-y-auto -mx-1 px-1">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setMoveTargetGroup(g.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                moveTargetGroup === g.id
                  ? "font-medium shadow-sm"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              )}
              style={{
                background: moveTargetGroup === g.id ? "var(--app-accent)" : "transparent",
                color: moveTargetGroup === g.id ? "#fff" : "var(--app-text-secondary)",
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  background: moveTargetGroup === g.id ? "rgba(255,255,255,0.9)" : g.color,
                }}
              />
              <span className="flex-1 text-left">{g.name}</span>
              <span
                className="text-[10px]"
                style={{
                  color: moveTargetGroup === g.id
                    ? "rgba(255,255,255,0.8)"
                    : "var(--app-text-tertiary)",
                }}
              >
                {g.itemCount} 项
              </span>
              {moveTargetGroup === g.id && (
                <CheckSquare className="w-4 h-4 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        open={showGroupManageModal}
        onClose={() => {
          setShowGroupManageModal(false);
          setManagePostId("");
        }}
        title={
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5" style={{ color: "var(--app-accent)" }} />
            管理收藏分组
          </div>
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowGroupManageModal(false);
                setManagePostId("");
              }}
            >
              关闭
            </Button>
          </>
        }
      >
        <div className="space-y-1.5 max-h-80 overflow-y-auto -mx-1 px-1">
          {groups.filter((g) => g.id !== "fg1").map((g) => {
            const isInGroup = managePostId ? getPostFavoriteGroups(managePostId).includes(g.id) : false;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  if (managePostId) {
                    toggleFavoriteInGroup(managePostId, g.id);
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  isInGroup
                    ? "font-medium shadow-sm"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                )}
                style={{
                  background: isInGroup ? "var(--app-accent)" : "transparent",
                  color: isInGroup ? "#fff" : "var(--app-text-secondary)",
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: isInGroup ? "rgba(255,255,255,0.9)" : g.color,
                  }}
                />
                <span className="flex-1 text-left">{g.name}</span>
                <span
                  className="text-[10px]"
                  style={{
                    color: isInGroup
                      ? "rgba(255,255,255,0.8)"
                      : "var(--app-text-tertiary)",
                  }}
                >
                  {g.itemCount} 项
                </span>
                {isInGroup && (
                  <CheckSquare className="w-4 h-4 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

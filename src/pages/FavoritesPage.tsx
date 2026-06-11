import { useState, useMemo } from "react";
import { useAppStore } from "@/stores/appStore";
import { FAVORITE_GROUPS as MOCK_GROUPS, FAVORITE_ITEMS as MOCK_ITEMS, REPLIES } from "@/mock";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Dropdown, { type DropdownItem } from "@/components/ui/Dropdown";
import Empty from "@/components/ui/Empty";
import Modal from "@/components/ui/Modal";
import Tabs from "@/components/ui/Tabs";
import type { TabItem } from "@/components/ui/Tabs";
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
  ArrowUp,
  ArrowDown,
  Palette,
  LayoutGrid,
  List,
  User,
  Tag,
} from "lucide-react";
import { cn, formatTime, formatNumber, formatDate } from "@/lib/utils";
import type { Post, Reply } from "@/types";

const SORT_OPTIONS = [
  { key: "added", label: "收藏时间", icon: Clock },
  { key: "hot", label: "内容热度", icon: Flame },
  { key: "alpha", label: "字母序", icon: Type },
];

const GROUP_COLORS = [
  "#007AFF",
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#34C759",
  "#00C7BE",
  "#5856D6",
  "#AF52DE",
  "#FF2D55",
  "#8E8E93",
  "#636366",
  "#000000",
];

const DEFAULT_GROUP_COLOR = "#007AFF";

const ORGANIZE_TABS: TabItem[] = [
  { key: "author", label: "按作者", icon: <User className="w-4 h-4" /> },
  { key: "tag", label: "按标签", icon: <Tag className="w-4 h-4" /> },
  { key: "color", label: "按分组颜色", icon: <Palette className="w-4 h-4" /> },
];

type ViewMode = "grid" | "organize";
type OrganizeBy = "author" | "tag" | "color";

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
    reorderFavoriteGroups,
    updateFavoriteGroup,
    setFavoriteItemRemark,
    getPostById,
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
  const [managePostId, setManagePostId] = useState("");
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [editingRemarkItemId, setEditingRemarkItemId] = useState<string | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [organizeBy, setOrganizeBy] = useState<OrganizeBy>("author");

  const activeGroup = groups.find((g) => g.id === activeFavoriteGroupId);

  const activeGroupItems = useMemo(() => {
    const getHitTypes = (item: typeof items[0], kw: string): string[] => {
      const hitTypes: string[] = [];
      if (!kw) return hitTypes;
      
      const kwLower = kw.toLowerCase();
      const target = item.target as Post | Reply | undefined;
      const post = target as Post;
      const reply = target as Reply;
      
      const postTitle = post?.title || "";
      const authorNickname = post?.author?.nickname || reply?.author?.nickname || "";
      const remark = item.remark || "";
      
      if (postTitle.toLowerCase().includes(kwLower)) hitTypes.push("标题");
      if (remark.toLowerCase().includes(kwLower)) hitTypes.push("备注");
      if (authorNickname.toLowerCase().includes(kwLower)) hitTypes.push("作者");
      
      return hitTypes;
    };

    let result =
      activeFavoriteGroupId === "fg1"
        ? items
        : items.filter((i) => i.groupId === activeFavoriteGroupId);

    if (searchQuery) {
      const kw = searchQuery.toLowerCase();
      result = result.filter((i) => {
        const target = i.target as Post | Reply | undefined;
        const postTarget = target as Post & { post?: Post };
        const replyTarget = target as Reply;
        const postTitle =
          (target as Post)?.title ||
          postTarget?.post?.title ||
          (replyTarget?.content?.slice(0, 30) || "");
        const authorNickname =
          (target as Post)?.author?.nickname ||
          postTarget?.post?.author?.nickname ||
          replyTarget?.author?.nickname ||
          "";
        const remark = i.remark || "";
        return (
          postTitle.toLowerCase().includes(kw) ||
          remark.toLowerCase().includes(kw) ||
          authorNickname.toLowerCase().includes(kw)
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

    return result.map((item) => ({
      ...item,
      hitTypes: getHitTypes(item, searchQuery),
    }));
  }, [items, activeFavoriteGroupId, searchQuery, sortBy]);

  const organizedData = useMemo(() => {
    type ItemWithPost = (typeof activeGroupItems)[number] & {
      post?: Post;
      group?: typeof groups[number];
      hitTypes: string[];
    };

    type OrganizedSection = {
      key: string;
      title: string;
      subtitle?: string;
      avatar?: string;
      color?: string;
      items: ItemWithPost[];
    };

    const itemsWithPost = activeGroupItems
      .filter((item) => item.targetType === "post")
      .map((item) => {
        const post = (item.target as Post) || getPostById(item.targetId);
        const group = groups.find((g) => g.id === item.groupId);
        return { ...item, post, group, hitTypes: (item as { hitTypes: string[] }).hitTypes };
      })
      .filter((item) => !!item.post) as (ItemWithPost & { post: Post })[];

    if (organizeBy === "author") {
      const map = new Map<string, ItemWithPost[]>();
      itemsWithPost.forEach((item) => {
        const authorId = item.post.authorId;
        if (!map.has(authorId)) map.set(authorId, []);
        map.get(authorId)!.push(item);
      });
      return Array.from(map.entries()).map<OrganizedSection>(([authorId, items]) => ({
        key: authorId,
        title: items[0].post.author.nickname,
        subtitle: `@${items[0].post.author.username}`,
        avatar: items[0].post.author.avatar,
        items,
      }));
    }

    if (organizeBy === "tag") {
      const map = new Map<string, ItemWithPost[]>();
      itemsWithPost.forEach((item) => {
        item.post.tags.forEach((tag) => {
          if (!map.has(tag.id)) map.set(tag.id, []);
          map.get(tag.id)!.push(item);
        });
      });
      return Array.from(map.entries()).map<OrganizedSection>(([tagId, items]) => {
        const tag = items[0].post.tags.find((t) => t.id === tagId)!;
        return {
          key: tagId,
          title: tag.name,
          color: tag.color,
          items,
        };
      });
    }

    if (organizeBy === "color") {
      const map = new Map<string, ItemWithPost[]>();
      itemsWithPost.forEach((item) => {
        const color = item.group?.color || DEFAULT_GROUP_COLOR;
        if (!map.has(color)) map.set(color, []);
        map.get(color)!.push(item);
      });
      return Array.from(map.entries()).map<OrganizedSection>(([color, items]) => ({
        key: color,
        title: items[0].group?.name || "未分组",
        color,
        items,
      }));
    }

    return [] as OrganizedSection[];
  }, [activeGroupItems, organizeBy, groups, getPostById]);

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

  const handleMoveGroupUp = (index: number) => {
    if (index <= 0) return;
    const orderedGroups = groups.slice().sort((a, b) => a.order - b.order);
    const newOrdered = [...orderedGroups];
    [newOrdered[index - 1], newOrdered[index]] = [newOrdered[index], newOrdered[index - 1]];
    reorderFavoriteGroups(newOrdered.map((g) => g.id));
  };

  const handleMoveGroupDown = (index: number) => {
    const orderedGroups = groups.slice().sort((a, b) => a.order - b.order);
    if (index >= orderedGroups.length - 1) return;
    const newOrdered = [...orderedGroups];
    [newOrdered[index + 1], newOrdered[index]] = [newOrdered[index], newOrdered[index + 1]];
    reorderFavoriteGroups(newOrdered.map((g) => g.id));
  };

  const handleUpdateGroupColor = (groupId: string, color: string) => {
    updateFavoriteGroup(groupId, { color });
    setShowColorPicker(null);
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

  const sortedGroups = groups.slice().sort((a, b) => a.order - b.order);

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
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-0.5">
          {sortedGroups.map((g, idx) => {
            const isActive = g.id === activeFavoriteGroupId;
            const isEditing = editingGroup === g.id;
            const isFG1 = g.id === "fg1";
            const isDragOver = dragOverGroup === g.id && draggedItem;
            const groupColor = g.color || DEFAULT_GROUP_COLOR;

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
                      style={{ background: groupColor }}
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
                        background: isActive ? "rgba(255,255,255,0.9)" : groupColor,
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
                      {!isFG1 && idx > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveGroupUp(idx);
                          }}
                          className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                          style={{ color: "var(--app-text-secondary)" }}
                          title="上移"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                      )}
                      {!isFG1 && idx < sortedGroups.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveGroupDown(idx);
                          }}
                          className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                          style={{ color: "var(--app-text-secondary)" }}
                          title="下移"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      )}
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
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowColorPicker(showColorPicker === g.id ? null : g.id);
                            }}
                            className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ color: "var(--app-text-secondary)" }}
                            title="更改颜色"
                          >
                            <Palette className="w-3 h-3" />
                          </button>
                          {showColorPicker === g.id && (
                            <div
                              className="absolute right-0 top-full mt-1 p-2 rounded-lg shadow-mac-lg z-20 grid grid-cols-6 gap-1.5"
                              style={{
                                background: "var(--app-surface)",
                                border: "1px solid var(--app-border)",
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {GROUP_COLORS.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => handleUpdateGroupColor(g.id, c)}
                                  className={cn(
                                    "w-5 h-5 rounded-full transition-all hover:scale-110",
                                    groupColor === c && "ring-2 ring-offset-1 scale-110"
                                  )}
                                  style={{
                                    background: c,
                                    boxShadow:
                                      groupColor === c ? `0 0 0 2px ${c}40` : "none",
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
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
                  placeholder="搜索标题、备注、作者..."
                  className="mac-input pl-9 pr-8 text-sm h-9 !py-1.5 w-64"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                    style={{ color: "var(--app-text-tertiary)" }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center rounded-full overflow-hidden border" style={{ borderColor: "var(--app-border)" }}>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "px-3 py-1.5 text-xs flex items-center gap-1.5 transition-all",
                    viewMode === "grid" ? "font-medium" : "hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                  style={{
                    background: viewMode === "grid" ? "var(--app-accent)" : "transparent",
                    color: viewMode === "grid" ? "#fff" : "var(--app-text-secondary)",
                  }}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  网格
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("organize")}
                  className={cn(
                    "px-3 py-1.5 text-xs flex items-center gap-1.5 transition-all",
                    viewMode === "organize" ? "font-medium" : "hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                  style={{
                    background: viewMode === "organize" ? "var(--app-accent)" : "transparent",
                    color: viewMode === "organize" ? "#fff" : "var(--app-text-secondary)",
                  }}
                >
                  <List className="w-3.5 h-3.5" />
                  整理
                </button>
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
          {viewMode === "organize" ? (
            <div className="space-y-6">
              <Tabs
                items={ORGANIZE_TABS}
                activeKey={organizeBy}
                onChange={(key) => setOrganizeBy(key as OrganizeBy)}
                variant="segmented"
                className="mb-4"
              />

              {organizedData.length > 0 ? (
                organizedData.map((section) => (
                  <section key={section.key}>
                    <div className="flex items-center gap-3 mb-3">
                      {section.avatar ? (
                        <Avatar src={section.avatar} name={section.title} size="md" />
                      ) : (
                        <span
                          className="w-8 h-8 rounded-full flex-shrink-0"
                          style={{ background: section.color || DEFAULT_GROUP_COLOR }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className="text-sm font-semibold truncate"
                            style={{ color: "var(--app-text-primary)" }}
                          >
                            {section.title}
                          </h3>
                          {section.color && (
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: section.color }}
                            />
                          )}
                        </div>
                        {section.subtitle && (
                          <p
                            className="text-xs truncate"
                            style={{ color: "var(--app-text-tertiary)" }}
                          >
                            {section.subtitle}
                          </p>
                        )}
                      </div>
                      <Badge variant="gray" size="sm" count={section.items.length} />
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                      {section.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => item.post && setActivePost(item.post.id)}
                          className="flex-shrink-0 w-56 rounded-xl p-3 cursor-pointer transition-all hover:shadow-md"
                          style={{
                            background: "var(--app-surface)",
                            border: "1px solid var(--app-border)",
                          }}
                        >
                          {item.hitTypes?.length > 0 && (
                            <div className="flex items-center gap-1 mb-2 flex-wrap">
                              {item.hitTypes.map((type) => (
                                <span
                                  key={type}
                                  className="text-[9px] px-1.5 py-0.5 rounded-full"
                                  style={{
                                    background: "var(--app-accent)",
                                    color: "#fff",
                                  }}
                                >
                                  命中：{type}
                                </span>
                              ))}
                            </div>
                          )}
                          <h4
                            className="text-xs font-semibold line-clamp-2 mb-2"
                            style={{ color: "var(--app-text-primary)" }}
                          >
                            {item.post?.title || "(无标题)"}
                          </h4>
                          {item.remark && (
                            <p
                              className="text-[10px] italic line-clamp-1 mb-2"
                              style={{ color: "var(--app-text-secondary)" }}
                            >
                              {item.remark}
                            </p>
                          )}
                          <div
                            className="flex items-center justify-between text-[9px]"
                            style={{ color: "var(--app-text-tertiary)" }}
                          >
                            <span>{formatDate(item.addedAt)}</span>
                            {item.group && (
                              <span
                                className="inline-flex items-center gap-1"
                                style={{ color: item.group.color || DEFAULT_GROUP_COLOR }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: item.group.color || DEFAULT_GROUP_COLOR }}
                                />
                                {item.group.name}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <Empty type="favorites" title="该维度下暂无收藏内容" />
              )}
            </div>
          ) : activeGroupItems.length > 0 ? (
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
                    {(item as { hitTypes?: string[] }).hitTypes?.length > 0 && (
                      <div className="flex items-center gap-1 mb-2 flex-wrap">
                        {(item as { hitTypes: string[] }).hitTypes.map((type) => (
                          <span
                            key={type}
                            className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{
                              background: "var(--app-accent)",
                              color: "#fff",
                            }}
                          >
                            命中：{type}
                          </span>
                        ))}
                      </div>
                    )}
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
                                key: "remark",
                                label: "编辑备注",
                                icon: <MessageSquare className="w-4 h-4" />,
                                onClick: () => {
                                  handleOpenRemarkModal(item.id, item.remark);
                                },
                              },
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
                          className="text-xs line-clamp-2 mb-2"
                          style={{ color: "var(--app-text-secondary)" }}
                        >
                          {post?.content
                            ?.replace(/[#*`[\]()>-]/g, "")
                            .slice(0, 80) || reply?.content?.slice(0, 80)}
                          ...
                        </p>

                        {item.remark && (
                          <p
                            className="text-xs italic line-clamp-2 mb-2"
                            style={{ color: "var(--app-text-secondary)" }}
                          >
                            {item.remark}
                          </p>
                        )}
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
                        {item.remark && (
                          <span className="inline-flex items-center gap-0.5" title={item.remark}>
                            <MessageSquare className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRemarkModal(item.id, item.remark);
                        }}
                        className="text-[10px] px-2 py-1 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100"
                        style={{ color: "var(--app-text-secondary)" }}
                      >
                        <MessageSquare className="w-3 h-3 inline mr-1" />
                        {item.remark ? "编辑备注" : "添加备注"}
                      </button>
                    </div>

                    {post && (
                      <div
                        className="mt-2 pt-3 flex items-center justify-between"
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
                  background: moveTargetGroup === g.id ? "rgba(255,255,255,0.9)" : g.color || DEFAULT_GROUP_COLOR,
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
                    background: isInGroup ? "rgba(255,255,255,0.9)" : g.color || DEFAULT_GROUP_COLOR,
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

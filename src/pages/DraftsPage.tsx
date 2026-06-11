import { useState, useMemo } from "react";
import { useAppStore } from "@/stores/appStore";
import { CATEGORIES, TAGS } from "@/mock";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Dropdown, { type DropdownItem } from "@/components/ui/Dropdown";
import Empty from "@/components/ui/Empty";
import Modal from "@/components/ui/Modal";
import {
  Plus,
  Search,
  ArrowUpDown,
  Clock,
  Calendar,
  Filter,
  FileEdit,
  Trash2,
  X,
  Image,
  Folder,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { formatTime, stripMarkdown } from "@/lib/utils";

const FILTER_OPTIONS = [
  { key: "all", label: "全部" },
  { key: "auto", label: "自动保存" },
  { key: "manual", label: "手动保存" },
];

const SORT_OPTIONS = [
  { key: "recent", label: "最近编辑", icon: Clock },
  { key: "created", label: "创建时间", icon: Calendar },
];

export default function DraftsPage() {
  const { drafts, deleteDraft, setShowEditor } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "auto" | "manual">("all");
  const [sortBy, setSortBy] = useState<"recent" | "created">("recent");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredDrafts = useMemo(() => {
    let result = [...drafts];

    if (searchQuery) {
      const kw = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(kw) ||
          stripMarkdown(d.content).toLowerCase().includes(kw)
      );
    }

    if (filterBy === "auto") {
      result = result.filter((d) => d.autoSaved);
    } else if (filterBy === "manual") {
      result = result.filter((d) => !d.autoSaved);
    }

    result.sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      }
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    });

    return result;
  }, [drafts, searchQuery, filterBy, sortBy]);

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    const findCategory = (cats: typeof CATEGORIES): typeof CATEGORIES[0] | undefined => {
      for (const cat of cats) {
        if (cat.id === categoryId) return cat;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findCategory(CATEGORIES)?.name;
  };

  const getTagNames = (tagIds: string[]) => {
    return tagIds
      .map((id) => TAGS.find((t) => t.id === id)?.name)
      .filter(Boolean) as string[];
  };

  const handleDelete = (id: string) => {
    deleteDraft(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden app-transition" style={{ background: "var(--app-bg)" }}>
      <div
        className="flex-shrink-0 border-b vibrant-toolbar px-5 py-4"
        style={{ borderBottomColor: "var(--app-border)" }}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <FileEdit
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "var(--app-accent)" }}
            />
            <h1
              className="text-lg font-bold truncate"
              style={{ color: "var(--app-text-primary)" }}
            >
              草稿箱
            </h1>
            <Badge variant="gray" size="sm" count={filteredDrafts.length} className="ml-1" />
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowEditor(true)}
          >
            新建草稿
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--app-text-tertiary)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索标题或内容..."
              className="mac-input pl-9 pr-8 text-sm h-9 !py-1.5 w-full"
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

          <Dropdown
            trigger={
              <Button variant="secondary" size="sm" leftIcon={<Filter className="w-3.5 h-3.5" />}>
                {FILTER_OPTIONS.find((o) => o.key === filterBy)?.label}
              </Button>
            }
            items={FILTER_OPTIONS.map<DropdownItem>((opt) => ({
              key: opt.key,
              label: opt.label,
              onClick: () => setFilterBy(opt.key as typeof filterBy),
            }))}
            placement="bottom-left"
          />

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
                  </span>
                ),
                onClick: () => setSortBy(opt.key as typeof sortBy),
              };
            })}
            placement="bottom-left"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-5">
        {filteredDrafts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDrafts.map((draft) => {
              const categoryName = getCategoryName(draft.categoryId);
              const tagNames = getTagNames(draft.tagIds);
              const previewContent = stripMarkdown(draft.content).slice(0, 150);

              return (
                <div
                  key={draft.id}
                  className="rounded-xl p-4 transition-all hover:shadow-md"
                  style={{
                    background: "var(--app-surface)",
                    border: "1px solid var(--app-border)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-base font-bold mb-2 line-clamp-1"
                        style={{ color: "var(--app-text-primary)" }}
                      >
                        {draft.title || "(无标题)"}
                      </h3>
                      <p
                        className="text-sm line-clamp-2"
                        style={{ color: "var(--app-text-secondary)" }}
                      >
                        {previewContent || "(无内容)"}
                        {previewContent.length >= 150 && "..."}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        variant="primary"
                        size="xs"
                        leftIcon={<FileEdit className="w-3 h-3" />}
                        onClick={() => setShowEditor(true, draft.id)}
                      >
                        继续编辑
                      </Button>
                      <Button
                        variant="danger"
                        size="xs"
                        leftIcon={<Trash2 className="w-3 h-3" />}
                        onClick={() => setDeleteConfirmId(draft.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>

                  <div
                    className="pt-3 flex flex-wrap items-center gap-x-3 gap-y-2"
                    style={{ borderTop: "1px solid var(--app-border)" }}
                  >
                    <Badge
                      variant={draft.autoSaved ? "gray" : "primary"}
                      size="sm"
                    >
                      {draft.autoSaved ? "自动保存" : "手动保存"}
                    </Badge>

                    <span
                      className="text-xs inline-flex items-center gap-1"
                      style={{ color: "var(--app-text-tertiary)" }}
                    >
                      <Clock className="w-3 h-3" />
                      {formatTime(draft.savedAt)}
                    </span>

                    {draft.images.length > 0 && (
                      <span
                        className="text-xs inline-flex items-center gap-1"
                        style={{ color: "var(--app-text-tertiary)" }}
                      >
                        <Image className="w-3 h-3" />
                        x{draft.images.length}
                      </span>
                    )}

                    {categoryName && (
                      <span
                        className="text-xs inline-flex items-center gap-1"
                        style={{ color: "var(--app-text-tertiary)" }}
                      >
                        <Folder className="w-3 h-3" />
                        分区：{categoryName}
                      </span>
                    )}

                    {tagNames.length > 0 && (
                      <span
                        className="text-xs inline-flex items-center gap-1"
                        style={{ color: "var(--app-text-tertiary)" }}
                      >
                        <Tag className="w-3 h-3" />
                        标签：{tagNames.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : searchQuery ? (
          <Empty type="search" />
        ) : (
          <Empty
            type="posts"
            title="还没有草稿"
            description="去写点什么吧~"
            actionLabel="新建帖子"
            onAction={() => setShowEditor(true)}
          />
        )}
      </div>

      <Modal
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title={
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" style={{ color: "var(--app-danger)" }} />
            <span>确认删除</span>
          </div>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
              取消
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-sm" style={{ color: "var(--app-text-secondary)" }}>
          确定要删除这篇草稿吗？删除后无法恢复。
        </p>
      </Modal>
    </div>
  );
}
